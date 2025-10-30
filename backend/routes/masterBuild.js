// backend/routes/masterBuild.js - COMPLETE WORKING VERSION
const express = require('express');
const router = express.Router();
const MasterOrchestrator = require('../agents/masterOrchestrator');
const { UserService, ProjectService, NotificationService } = require('../services/database');
const { authenticateToken } = require('./authWithDb');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs').promises;

// In-memory build tracking
const activeBuild = new Map();

// ==========================================
// POST /api/master/build - START BUILD (FIXED)
// ==========================================
router.post('/build', authenticateToken, async (req, res) => {
  try {
    const {
      projectId,
      projectName,
      description,
      targetCountry,
      features,
      targetPlatform,
      framework,
      database
    } = req.body;

    // Validation
    if (!projectName || !description) {
      return res.status(400).json({
        error: 'Project name and description required'
      });
    }

    if (description.length < 20) {
      return res.status(400).json({
        error: 'Please provide a detailed description (minimum 20 characters)'
      });
    }

    // Get user and check credits
    const user = await UserService.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.credits <= 0) {
      return res.status(403).json({
        error: 'No credits remaining',
        credits: user.credits,
        upgrade_url: '/pricing'
      });
    }

    console.log('🚀 BUILD START:', {
      user: user.email,
      credits: user.credits,
      project: projectName,
      tier: user.tier
    });

    // Deduct credit FIRST
    await UserService.deductCredit(user.id);
    console.log('✅ Credit deducted. Remaining:', user.credits - 1);

    // Get or create project ID
    let dbProjectId = projectId;
    
    if (!dbProjectId) {
      const newProject = await ProjectService.create({
        userId: user.id,
        name: projectName,
        description,
        prompt: description,
        framework: framework || 'react',
        database: database || 'postgresql',
        targetPlatform: targetPlatform || 'web',
        status: 'building',
        buildProgress: 0
      });
      dbProjectId = newProject.id;
      console.log('✅ Project created in DB:', dbProjectId);
    }

    // Generate unique build ID
    const buildId = `build_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Initialize tracking
    activeBuild.set(buildId, {
      status: 'building',
      phase: 'research',
      progress: 0,
      message: 'Starting build...',
      started_at: new Date().toISOString(),
      user_id: user.id,
      project_id: dbProjectId,
      logs: []
    });

    // Prepare project data
    const projectData = {
      projectName,
      description,
      targetCountry: targetCountry || 'Global',
      features: features || [],
      targetPlatform: targetPlatform || 'web',
      framework: framework || 'react',
      database: database || 'postgresql',
      buildId,
      projectId: dbProjectId,
      userId: user.id,
      tier: user.tier
    };

    // Create initial notification
    await NotificationService.create(user.id, {
      title: 'Build Started! 🚀',
      message: `Building "${projectName}"...`,
      type: 'build',
      actionUrl: `/projects/${dbProjectId}`,
      actionText: 'View Progress'
    });

    // Start async build (don't await)
    runMasterBuild(buildId, projectData, user.tier).catch(error => {
      console.error(`❌ Build ${buildId} failed:`, error);
      activeBuild.set(buildId, {
        ...activeBuild.get(buildId),
        status: 'failed',
        error: error.message,
        phase: 'error',
        progress: 0
      });
    });

    // Return immediately
    res.json({
      success: true,
      build_id: buildId,
      project_id: dbProjectId,
      message: 'Build started! Real AI agents are working...',
      estimated_time: '3-5 minutes',
      progress_url: `/api/master/build/${buildId}`,
      tier: user.tier,
      credits_remaining: user.credits - 1
    });

  } catch (error) {
    console.error('❌ Build start error:', error);
    res.status(500).json({
      error: 'Failed to start build',
      message: error.message
    });
  }
});

// ==========================================
// GET /api/master/build/:id - POLL PROGRESS (FIXED)
// ==========================================
router.get('/build/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const buildData = activeBuild.get(id);
    
    if (!buildData) {
      return res.status(404).json({
        error: 'Build not found',
        message: 'Invalid build ID or build expired'
      });
    }

    // If completed, return full results
    if (buildData.status === 'completed') {
      return res.json({
        status: 'completed',
        phase: 'done',
        progress: 100,
        message: 'Build complete! 🎉',
        results: buildData.results,
        download_url: `/api/master/download/${id}`,
        logs: buildData.logs
      });
    }

    // If failed, return error
    if (buildData.status === 'failed') {
      return res.json({
        status: 'failed',
        phase: 'error',
        progress: 0,
        message: buildData.error || 'Build failed',
        error: buildData.error,
        logs: buildData.logs
      });
    }

    // Return current progress
    res.json({
      status: buildData.status,
      phase: buildData.phase,
      progress: buildData.progress,
      message: buildData.message,
      current_task: buildData.current_task,
      logs: buildData.logs.slice(-20) // Last 20 logs
    });

  } catch (error) {
    console.error('❌ Progress fetch error:', error);
    res.status(500).json({
      error: 'Failed to get progress',
      message: error.message
    });
  }
});

// ==========================================
// GET /api/master/download/:id - DOWNLOAD (FIXED)
// ==========================================
router.get('/download/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const buildData = activeBuild.get(id);
    
    if (!buildData || buildData.status !== 'completed') {
      return res.status(404).json({
        error: 'Build not found or not completed',
        status: buildData?.status
      });
    }

    // Check ownership
    if (buildData.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if zip exists
    const zipPath = buildData.zip_path;
    
    if (!zipPath) {
      return res.status(404).json({ error: 'Download file not ready' });
    }

    try {
      await fs.access(zipPath);
    } catch {
      return res.status(404).json({ error: 'Download file expired or not found' });
    }

    const fileName = path.basename(zipPath);
    
    console.log('📦 Sending download:', fileName);

    // Update download tracking in DB
    if (buildData.project_id) {
      await ProjectService.update(buildData.project_id, {
        downloadedAt: new Date()
      });
    }

    // Send file
    res.download(zipPath, fileName, async (err) => {
      if (err) {
        console.error('Download error:', err);
      } else {
        console.log('✅ Download completed:', fileName);
        
        // Optionally delete after download
        // setTimeout(async () => {
        //   try {
        //     await fs.unlink(zipPath);
        //     console.log('🗑️ Cleaned up zip:', fileName);
        //   } catch (error) {
        //     console.error('Failed to delete zip:', error);
        //   }
        // }, 5000);
      }
    });

  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({
      error: 'Download failed',
      message: error.message
    });
  }
});

// ==========================================
// MAIN BUILD FUNCTION (ACTUALLY RUNS AGENTS)
// ==========================================
async function runMasterBuild(buildId, projectData, tier) {
  const updateProgress = (phase, progress, message, metadata = {}) => {
    const current = activeBuild.get(buildId) || {};
    const log = {
      timestamp: new Date().toISOString(),
      phase,
      progress,
      message
    };
    
    const logs = [...(current.logs || []), log];
    
    activeBuild.set(buildId, {
      ...current,
      status: 'building',
      phase,
      progress,
      message,
      current_task: message,
      logs,
      ...metadata
    });

    console.log(`[${buildId}] ${progress}% - ${message}`);
    
    // Update project in DB
    if (projectData.projectId) {
      ProjectService.update(projectData.projectId, {
        buildProgress: progress,
        buildData: { phase, progress, message, timestamp: log.timestamp }
      }).catch(err => console.error('DB update failed:', err));
    }
  };

  try {
    console.log('\n🚀 =================================');
    console.log('   STARTING REAL AI BUILD');
    console.log('   Build ID:', buildId);
    console.log('   Tier:', tier);
    console.log('=================================\n');

    // Initialize orchestrator WITH DB integration
    const orchestrator = new MasterOrchestrator(
      tier,
      projectData.projectId,
      projectData.userId
    );

    updateProgress('research', 5, '🔍 Starting market research with REAL web scraping...');

    // PHASE 1: REAL RESEARCH (0-30%)
    console.log('📊 PHASE 1: Market Intelligence (REAL API CALLS)');
    const phase1 = await orchestrator.executePhase1Research(projectData);
    
    updateProgress('research', 30, `✅ Research complete! Found ${phase1.competitors?.individual_analyses?.length || 0} competitors`);

    // PHASE 2: STRATEGY (30-50%)
    console.log('🎯 PHASE 2: Strategic Planning');
    updateProgress('strategy', 35, '🎯 Creating business strategy...');
    const phase2 = await orchestrator.executePhase2Planning(phase1);
    
    updateProgress('strategy', 50, `✅ Strategy ready with ${phase2.competitive_advantages?.length || 0} advantages`);

    // PHASE 3: CODE GENERATION (50-85%)
    console.log('💻 PHASE 3: Code Generation (REAL CODE)');
    updateProgress('code', 55, '🗄️ Designing database schema...');
    const phase3 = await orchestrator.executePhase3CodeGeneration(phase2, projectData);
    
    updateProgress('code', 85, `✅ Generated ${phase3.frontend?.stats?.total_files || 0} files`);

    // PHASE 4: QA & PACKAGING (85-100%)
    console.log('🧪 PHASE 4: Quality Assurance');
    updateProgress('testing', 90, '🧪 Running QA tests...');
    const phase4 = await orchestrator.executePhase4Quality(phase3);
    
    updateProgress('packaging', 95, '📦 Creating download package...');

    // Create ZIP file
    const zipPath = await createDownloadPackage(buildId, projectData.projectName, {
      phase1, phase2, phase3, phase4
    });

    console.log('✅ ZIP created:', zipPath);

    // Calculate final stats
    const timeTaken = Math.round((Date.now() - new Date(activeBuild.get(buildId).started_at).getTime()) / 1000);
    const filesGenerated = (phase3.frontend?.stats?.total_files || 0) + (phase3.backend?.stats?.total_files || 0);
    const linesOfCode = (phase3.frontend?.stats?.total_lines || 0) + (phase3.backend?.stats?.total_lines || 0);

    const finalResults = {
      success: true,
      build_id: buildId,
      project_name: projectData.projectName,
      phases: {
        research: phase1,
        strategy: phase2,
        code: phase3,
        quality: phase4
      },
      summary: {
        files_generated: filesGenerated,
        lines_of_code: linesOfCode,
        qa_score: phase4.qa_results?.overall_score || 0,
        research_score: phase4.research_verification?.score || 0,
        deployment_ready: phase4.deployment_ready || false,
        competitive_advantages: phase2.competitive_advantages?.length || 0,
        time_taken: timeTaken
      },
      tier,
      timestamp: new Date().toISOString()
    };

    // Mark project as completed in DB
    if (projectData.projectId) {
      await ProjectService.markCompleted(projectData.projectId, finalResults);
      console.log('✅ Project marked complete in DB');
    }

    // Send completion notification
    await NotificationService.create(projectData.userId, {
      title: 'Build Complete! 🎉',
      message: `Your project "${projectData.projectName}" is ready to download`,
      type: 'success',
      actionUrl: `/projects/${projectData.projectId}`,
      actionText: 'Download Now'
    });

    // Update build tracking
    activeBuild.set(buildId, {
      ...activeBuild.get(buildId),
      status: 'completed',
      phase: 'done',
      progress: 100,
      message: '🎉 Build complete! Ready to download.',
      results: finalResults,
      zip_path: zipPath,
      completed_at: new Date().toISOString()
    });

    console.log('\n✅ =================================');
    console.log('   BUILD COMPLETED SUCCESSFULLY!');
    console.log('   Files:', filesGenerated);
    console.log('   Lines:', linesOfCode);
    console.log('   Time:', timeTaken, 'seconds');
    console.log('=================================\n');

  } catch (error) {
    console.error('\n❌ BUILD FAILED:', error);
    console.error(error.stack);

    // Update build as failed
    activeBuild.set(buildId, {
      ...activeBuild.get(buildId),
      status: 'failed',
      phase: 'error',
      progress: 0,
      error: error.message,
      message: `Build failed: ${error.message}`
    });

    // Update project in DB
    if (projectData.projectId) {
      await ProjectService.update(projectData.projectId, {
        status: 'failed',
        buildData: { error: error.message }
      }).catch(err => console.error('Failed to update project:', err));
    }

    // Send failure notification
    await NotificationService.create(projectData.userId, {
      title: 'Build Failed ❌',
      message: `Build failed: ${error.message}`,
      type: 'error',
      actionUrl: `/projects/${projectData.projectId}`
    }).catch(err => console.error('Failed to send notification:', err));
  }
}

// ==========================================
// CREATE DOWNLOAD PACKAGE (FIXED)
// ==========================================
async function createDownloadPackage(buildId, projectName, results) {
  const tempDir = path.join(__dirname, '../temp');
  await fs.mkdir(tempDir, { recursive: true });

  const fileName = `${projectName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.zip`;
  const zipPath = path.join(tempDir, fileName);

  console.log('📦 Creating ZIP:', fileName);

  return new Promise((resolve, reject) => {
    const output = require('fs').createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`✅ ZIP created: ${archive.pointer()} bytes`);
      resolve(zipPath);
    });

    archive.on('error', (err) => {
      console.error('❌ ZIP creation failed:', err);
      reject(err);
    });

    archive.pipe(output);

    try {
      // Add frontend files
      if (results.phase3?.frontend?.files) {
        Object.entries(results.phase3.frontend.files).forEach(([filepath, content]) => {
          archive.append(content, { name: `frontend/${filepath}` });
        });
      }

      // Add backend files
      if (results.phase3?.backend?.files) {
        Object.entries(results.phase3.backend.files).forEach(([filepath, content]) => {
          archive.append(content, { name: `backend/${filepath}` });
        });
      }

      // Add database files
      if (results.phase3?.database?.migrations) {
        results.phase3.database.migrations.forEach((migration, i) => {
          const sql = typeof migration === 'string' ? migration : migration.sql;
          archive.append(sql, { 
            name: `database/migrations/${String(i + 1).padStart(3, '0')}_migration.sql` 
          });
        });
      }

      if (results.phase3?.database?.prismaSchema) {
        archive.append(results.phase3.database.prismaSchema, { 
          name: 'backend/prisma/schema.prisma' 
        });
      }

      // Add documentation
      archive.append(generateREADME(results), { name: 'README.md' });
      archive.append(generateResearchReport(results.phase1), { name: 'RESEARCH_REPORT.md' });

      archive.finalize();
    } catch (error) {
      console.error('❌ Error adding files to ZIP:', error);
      reject(error);
    }
  });
}

function generateREADME(results) {
  const summary = results.phase4?.qa_results || {};
  return `# ${results.phase2?.project_name || 'My App'}

**Built with Launch AI** 🚀
Generated: ${new Date().toISOString()}

## 📊 Build Stats

- **Files**: ${results.phase3?.frontend?.stats?.total_files || 0} + ${results.phase3?.backend?.stats?.total_files || 0}
- **Lines of Code**: ${(results.phase3?.frontend?.stats?.total_lines || 0) + (results.phase3?.backend?.stats?.total_lines || 0)}
- **QA Score**: ${summary.overall_score || 0}/100
- **Deployment Ready**: ${results.phase4?.deployment_ready ? '✅ YES' : '⚠️ Needs fixes'}

## 🎯 Competitive Advantages

${results.phase2?.competitive_advantages?.map((adv, i) => `${i + 1}. **${adv.feature}** - ${adv.source}`).join('\n') || 'Based on market research'}

## 🚀 Quick Start

### Frontend
\`\`\`bash
cd frontend
npm install
npm start
\`\`\`

### Backend
\`\`\`bash
cd backend
npm install
cp .env.example .env
# Edit .env with your config
npm run dev
\`\`\`

See RESEARCH_REPORT.md for market insights.
`;
}

function generateResearchReport(research) {
  return `# 📊 Market Research Report

Generated: ${new Date().toISOString()}

## Executive Summary

- **Competitors Analyzed**: ${research.competitors?.total_analyzed || 0}
- **Reviews Analyzed**: ${research.reviews?.total_reviews || 0}
- **Market Size**: ${research.market?.market_overview?.tam || 'N/A'}
- **Competition Level**: ${research.market?.competition_level || 'Unknown'}

## Detailed Analysis

${JSON.stringify(research, null, 2)}
`;
}

// Cleanup old builds every hour
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  activeBuild.forEach((data, buildId) => {
    const startTime = new Date(data.started_at).getTime();
    if (now - startTime > maxAge) {
      activeBuild.delete(buildId);
      console.log(`🗑️ Cleaned up old build: ${buildId}`);
    }
  });
}, 60 * 60 * 1000);

module.exports = router;
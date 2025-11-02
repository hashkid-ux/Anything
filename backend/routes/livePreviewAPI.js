// backend/routes/livePreviewAPI.js
// CREATE THIS NEW FILE

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./authWithDb');

const buildFilesCache = new Map();

// GET /api/preview/:buildId/files - Get all files
router.get('/:buildId/files', authenticateToken, async (req, res) => {
  try {
    const { buildId } = req.params;
    const cachedFiles = buildFilesCache.get(buildId);
    
    if (cachedFiles) {
      return res.json({
        success: true,
        buildId,
        files: cachedFiles.files,
        lastUpdated: cachedFiles.lastUpdated,
        fileCount: Object.keys(cachedFiles.files).length
      });
    }
    
    return res.status(404).json({
      error: 'Build not found or files not ready yet',
      buildId
    });
    
  } catch (error) {
    console.error('Preview files error:', error);
    res.status(500).json({
      error: 'Failed to get preview files',
      message: error.message
    });
  }
});

// GET /api/preview/:buildId/frontend - Get frontend files only
router.get('/:buildId/frontend', authenticateToken, async (req, res) => {
  try {
    const { buildId } = req.params;
    const cachedFiles = buildFilesCache.get(buildId);
    
    if (!cachedFiles) {
      return res.status(404).json({ error: 'Build not found' });
    }
    
    const frontendFiles = {};
    Object.entries(cachedFiles.files).forEach(([path, content]) => {
      if (path.startsWith('frontend/') || path.startsWith('src/')) {
        frontendFiles[path] = content;
      }
    });
    
    res.json({
      success: true,
      buildId,
      files: frontendFiles,
      fileCount: Object.keys(frontendFiles).length,
      lastUpdated: cachedFiles.lastUpdated
    });
    
  } catch (error) {
    console.error('Frontend files error:', error);
    res.status(500).json({
      error: 'Failed to get frontend files',
      message: error.message
    });
  }
});

// Cleanup old caches
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000;
  
  buildFilesCache.forEach((data, buildId) => {
    const age = now - new Date(data.lastUpdated).getTime();
    if (age > maxAge) {
      buildFilesCache.delete(buildId);
      console.log(`🗑️ Cleared old cache for build ${buildId}`);
    }
  });
}, 60 * 60 * 1000);

module.exports = { router, buildFilesCache };
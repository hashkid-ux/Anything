// backend/agents/codegen/databaseAgent.js
const AIClient = require('../../services/aiClient');

class DatabaseAgent {
  constructor(tier = 'free') {
    this.tier = tier;
    this.client = new AIClient(process.env.OPENROUTER_API_KEY);
    this.model = 'deepseek/deepseek-chat-v3.1:free';
    this.maxRetries = 3;
  }

  /**
   * Generates database schema using project requirements & research insights
   * @param {Object} enhancedRequirements - Features, UX, pain points, competitive advantages
   * @param {Object} researchData - Market, competitors, reviews, papers, margins
   * @returns {Object} JSON with Prisma schema, SQL migrations, seed data
   */
  async designSchemaWithResearch(enhancedRequirements, researchData) {
  let attempt = 0;
  
  while (attempt < this.maxRetries) {
    try {
      attempt++;
      console.log(`📊 Schema generation attempt ${attempt}/${this.maxRetries}`);

      const prompt = `Generate a PostgreSQL database schema. Return ONLY valid JSON, no markdown, no explanations.

Required JSON structure:
{
  "prisma_schema": "datasource db {\\n  provider = \\"postgresql\\"\\n  url = env(\\"DATABASE_URL\\")\\n}\\n\\nmodel User {\\n  id String @id @default(uuid())\\n  email String @unique\\n  name String\\n}",
  "sql_migrations": ["CREATE TABLE users (id UUID PRIMARY KEY, email TEXT UNIQUE, name TEXT);"],
  "seed_data": [],
  "stats": {"total_tables": 1, "total_relations": 0, "total_indexes": 1}
}

Project: ${JSON.stringify(enhancedRequirements).substring(0, 500)}

Return ONLY the JSON object above. No code blocks, no explanations.`;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      });

      const parsed = this.extractAndParseJSON(response.content[0].text);
      
      if (parsed && parsed.prisma_schema) {
        console.log('✅ Schema generated successfully');
        return {
          prisma_schema: parsed.prisma_schema,
          sql_migrations: parsed.sql_migrations || [],
          seed_data: parsed.seed_data || [],
          stats: parsed.stats || { total_tables: 1, total_relations: 0, total_indexes: 1 },
          migrations: (parsed.sql_migrations || []).map((sql, i) => ({
            name: `migration_${String(i + 1).padStart(3, '0')}`,
            sql: sql
          }))
        };
      }
      
      throw new Error('Invalid schema structure');

    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt >= this.maxRetries) {
        console.warn('⚠️ Using default schema');
        return this.getDefaultDatabaseSchema();
      }
      
      await this.sleep(2000);
    }
  }
  
  return this.getDefaultDatabaseSchema();
}

  /**
   * Extracts JSON from AI response, handling various formats
   */
  extractAndParseJSON(content) {
  if (!content) return null;

  try {
    // Remove markdown code blocks
    content = content.replace(/```(?:json)?/gi, '').trim();
    
    // Find JSON object
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('⚠️ No JSON object found');
      return null;
    }

    let jsonStr = jsonMatch[0];
    
    // Clean up common issues
    jsonStr = jsonStr
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/"|"/g, '"') // Fix curly quotes
      .replace(/\n/g, '\\n') // Escape newlines in strings
      .replace(/\t/g, ' '); // Replace tabs
    
    // Try parsing
    try {
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.warn('First parse failed, trying cleanup...', parseError.message);
      
      // More aggressive cleanup
      jsonStr = jsonStr
        .replace(/\\n/g, ' ') // Remove escaped newlines
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/"\s*:\s*"/g, '":"') // Fix spacing in key-value pairs
        .replace(/,\s*}/g, '}') // Remove trailing commas before }
        .replace(/,\s*]/g, ']'); // Remove trailing commas before ]
      
      return JSON.parse(jsonStr);
    }
  } catch (error) {
    console.error('🚨 JSON parse failed:', error.message);
    console.error('Content preview:', content.substring(0, 200));
    return null;
  }
}

  /**
   * Extract array items from raw JSON string
   */
  extractArrayItems(arrayContent) {
    const items = [];
    try {
      // Match quoted strings
      const matches = arrayContent.match(/"(?:[^"\\]|\\.)*"/g) || [];
      matches.forEach(match => {
        items.push(JSON.parse(match));
      });
    } catch (e) {
      console.warn('Array extraction error:', e.message);
    }
    return items;
  }

  /**
   * Get default Prisma schema if generation fails
   */
  getDefaultPrismaSchema() {
    return `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([email])
}

model Session {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([token])
}
`;
  }

  /**
   * Get default complete database schema
   */
  getDefaultDatabaseSchema() {
    return {
      prisma_schema: this.getDefaultPrismaSchema(),
      sql_migrations: [
        `CREATE TABLE "User" (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password TEXT, "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP);`,
        `CREATE TABLE "Session" (id TEXT PRIMARY KEY, "userId" TEXT, token TEXT UNIQUE, "expiresAt" TIMESTAMP, "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`,
        `CREATE INDEX "User_email" ON "User"(email);`,
        `CREATE INDEX "Session_userId" ON "Session"("userId");`,
        `CREATE INDEX "Session_token" ON "Session"(token);`
      ],
      seed_data: [],
      stats: {
        total_tables: 2,
        total_relations: 1,
        total_indexes: 3
      },
      migrations: [
        {
          name: 'migration_001_initial_schema',
          sql: `CREATE TABLE "User" (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password TEXT, "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP);`
        },
        {
          name: 'migration_002_add_sessions',
          sql: `CREATE TABLE "Session" (id TEXT PRIMARY KEY, "userId" TEXT, token TEXT UNIQUE, "expiresAt" TIMESTAMP, "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`
        }
      ]
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = DatabaseAgent;
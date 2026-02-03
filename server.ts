
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { GoogleGenAI } from "@google/genai";
import path from 'path';
import { fileURLToPath } from 'url';
// @ts-ignore
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const app = express();

/**
 * 1. CONFIGURATION
 */
const PORT = Number(process.env.PORT) || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'opspilot_prod_secret_123';
const DIST_PATH = path.resolve(__dirname, 'dist');

/**
 * 2. CORE MIDDLEWARE
 */
app.use(express.json() as any);
app.use(express.urlencoded({ extended: true }) as any);

// Request Logger for debugging route hits
app.use((req, res, next) => {
  console.log(`[REQUEST] ${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// CORS (Allow-All for Preview/Dev environments)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-workspace-id');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

/**
 * 3. PRIMARY API ROUTES
 * Registered BEFORE static assets to ensure /api/ calls never fall through to index.html
 */

// Health Check - Priority #1
app.get('/api/health', (req, res) => {
  console.log('[API] Health check requested');
  res.status(200).json({ 
    ok: true, 
    status: 'online',
    timestamp: new Date().toISOString(),
    api_key_present: !!process.env.API_KEY,
    port: PORT,
    environment: process.env.NODE_ENV || 'production'
  });
});

const authRouter = express.Router();

authRouter.post("/register", async (req: any, res: any) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

    const existing = await (prisma as any).user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await (prisma as any).user.create({
      data: { name, email, passwordHash, role: 'OWNER' }
    });

    const workspace = await (prisma as any).workspace.create({
      data: { name: `${name}'s Workspace`, slug: `ws-${Date.now()}` }
    });

    await (prisma as any).membership.create({
      data: { userId: user.id, workspaceId: workspace.id, role: 'OWNER' }
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, ...userPublic } = user;

    return res.status(201).json({ token, user: userPublic });
  } catch (err: any) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

authRouter.post("/login", async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const user = await (prisma as any).user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, ...userPublic } = user;
    return res.json({ token, user: userPublic });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

authRouter.get("/me", async (req: any, res: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await (prisma as any).user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, avatar: true }
    });
    if (!user) return res.status(401).json({ message: 'User no longer exists' });
    return res.json({ user });
  } catch (err: any) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

app.use("/api/auth", authRouter);

// AI Chat Proxy
app.post('/api/ai/chat', async (req: any, res: any) => {
  const { message, context } = req.body;
  if (!process.env.API_KEY) return res.status(500).json({ error: "API Key missing" });

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `System Context: ${JSON.stringify(context)}\n\nUser: ${message}`,
      config: {
        systemInstruction: "You are OpsPilot AI. Help the user manage their operations workspace."
      }
    });
    res.json({ text: response.text });
  } catch (error) {
    res.status(500).json({ error: "AI processing failed" });
  }
});

// Dashboard Metrics
app.get('/api/dashboard/metrics', async (req, res) => {
  res.json({
    kpis: { revenueToday: 1250, revenue30d: 45000, ordersToday: 8, orders30d: 210, newLeadsToday: 4, conversionRate: 15, totalLeads: 120 },
    feed: [],
    freshness: { lastWebhookAt: new Date(), lastPollingAt: new Date() }
  });
});

/**
 * 4. STATIC FRONTEND SERVING
 */

// Serve compiled static assets
app.use(express.static(DIST_PATH) as any);

// Explicit 404 for unhandled API routes (prevents them falling through to index.html)
app.all('/api/*', (req, res) => {
  console.warn(`[API] 404 - Endpoint not found: ${req.url}`);
  res.status(404).json({ error: 'API endpoint not found', path: req.url });
});

// SPA Fallback: All other routes serve index.html
app.get('*', (req: any, res: any) => {
  const indexPath = path.join(DIST_PATH, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.warn(`[STATIC] Failed to serve index.html from ${DIST_PATH}. Displaying runtime fallback.`);
      res.status(404).send(`
        <div style="font-family: sans-serif; padding: 50px; text-align: center; color: #334155;">
          <h1 style="color: #4f46e5; margin-bottom: 10px;">OpsPilot Server Active</h1>
          <p>The backend is running, but the frontend build (dist) was not found.</p>
          <p style="font-size: 13px; color: #94a3b8;">Path Attempted: ${indexPath}</p>
          <hr style="max-width: 200px; margin: 30px auto; border: none; border-top: 1px solid #e2e8f0;">
          <a href="/api/health" style="color: #4f46e5; text-decoration: none; font-weight: bold;">Check API Health →</a>
        </div>
      `);
    }
  });
});

/**
 * 5. START SERVER
 */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  🚀 OPS-PILOT UNIFIED SERVER ONLINE
  ----------------------------------
  📡 Listening on:  http://0.0.0.0:${PORT}
  🏥 Health check:  http://0.0.0.0:${PORT}/api/health
  📂 Serving dist:  ${DIST_PATH}
  ----------------------------------
  `);
});


/**
 * PRODUCTION REFERENCE: OpsPilot Backend (Node.js/Express)
 * Enhanced with Server-Side Gemini AI + Function Calling
 */

import express from 'express';
import crypto from 'crypto';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';

const app = express();
// Fixed: Cast express.json() to any to bypass typing mismatch with PathParams
app.use(express.json() as any);

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || 'your_shopify_secret';
const WP_WEBHOOK_SECRET = process.env.WP_WEBHOOK_SECRET || 'opspilot_wp_secure_token_123';

// Store for SSE clients to enable real-time broadcasting
// Fixed: Use any for res to ensure compatibility with SSE methods like write()
let sseClients: { id: number; res: any }[] = [];
const processedWebhookIds = new Set<string>();

// Fixed: Used any for middleware result to avoid RequestHandler mismatch
const rawBodyMiddleware = express.raw({ type: 'application/json' }) as any;

/**
 * AI FUNCTION DECLARATIONS (TOOLS)
 */
const tools: FunctionDeclaration[] = [
  {
    name: 'create_task',
    description: 'Create a new task in the workspace',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'The title of the task' },
        description: { type: Type.STRING, description: 'Detailed description of the task' },
        priority: { type: Type.STRING, enum: ['low', 'medium', 'high', 'urgent'] },
        projectId: { type: Type.STRING, description: 'The ID of the project to associate with' }
      },
      required: ['title', 'priority']
    }
  },
  {
    name: 'update_task_status',
    description: 'Update the status of an existing task',
    parameters: {
      type: Type.OBJECT,
      properties: {
        taskId: { type: Type.STRING, description: 'The unique ID of the task' },
        status: { type: Type.STRING, enum: ['todo', 'in-progress', 'review', 'done'] }
      },
      required: ['taskId', 'status']
    }
  },
  {
    name: 'move_lead_stage',
    description: 'Move a sales lead to a different stage in the pipeline',
    parameters: {
      type: Type.OBJECT,
      properties: {
        leadId: { type: Type.STRING, description: 'The unique ID of the lead' },
        stage: { type: Type.STRING, enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'] }
      },
      required: ['leadId', 'stage']
    }
  },
  {
    name: 'fetch_dashboard_metrics',
    description: 'Retrieve current operational metrics for the workspace',
    parameters: {
      type: Type.OBJECT,
      // Fixed: Added non-empty property to satisfy Type.OBJECT requirement
      properties: {
        workspaceId: { type: Type.STRING, description: 'The ID of the workspace to fetch metrics for' }
      },
      required: ['workspaceId']
    }
  }
];

/**
 * AI CHAT ENDPOINT
 * Handles server-side Gemini logic and tool execution
 */
// Fixed: Used any for req and res to bypass broken Express type definitions in the environment
app.post('/api/ai/chat', async (req: any, res: any) => {
  const { message, context } = req.body;

  try {
    // ALWAYS initialize GoogleGenAI with process.env.API_KEY directly
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Initial request to model with tools enabled
    // Use gemini-3-pro-preview for complex reasoning and function calling tasks
    let response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        { role: 'user', parts: [{ text: `System Context: ${JSON.stringify(context)}\n\nUser: ${message}` }] }
      ],
      config: {
        systemInstruction: "You are the OpsPilot AI Assistant. You have access to tools to manage tasks and leads. When a user asks to do something (like creating a task or moving a lead), use the corresponding tool. Always confirm actions you've taken.",
        tools: [{ functionDeclarations: tools }]
      }
    });

    const candidate = response.candidates[0];
    // Used the response.functionCalls property directly
    const functionCalls = response.functionCalls;

    // If the model wants to call functions, we execute them and send results back
    if (functionCalls && functionCalls.length > 0) {
      const functionResponses = [];

      for (const call of functionCalls) {
        console.log(`Executing tool: ${call.name}`, call.args);

        let result: any = { status: 'success' };

        // Mock execution of tools (in a real app, these would interact with your DB)
        if (call.name === 'fetch_dashboard_metrics') {
          result = { 
            revenue30d: 45200, 
            activeLeads: 12, 
            openTasks: 8, 
            topProject: "Alpha Launch" 
          };
        } else if (call.name === 'create_task') {
          result = { taskId: `t_${Date.now()}`, message: "Task created successfully" };
          // Logic to notify frontend via SSE could go here
          broadcastEvent('AI_ACTION', { action: 'TASK_CREATED', details: (call.args as any).title });
        }

        functionResponses.push({
          id: call.id,
          name: call.name,
          response: result
        });
      }

      // Final model turn after tool execution
      const finalResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          { role: 'user', parts: [{ text: message }] },
          candidate.content,
          // Correct multi-turn structure: tool responses always have a 'user' role
          { role: 'user', parts: functionResponses.map(fr => ({ functionResponse: fr })) }
        ],
        config: { tools: [{ functionDeclarations: tools }] }
      });

      // Use the .text property directly
      return res.json({ text: finalResponse.text });
    }

    // No tool calls, just normal response
    // Use the .text property directly
    res.json({ text: response.text });

  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Failed to process AI request." });
  }
});

/**
 * SSE ENDPOINT: Dashboard Live Feed
 */
// Fixed: Used any for req and res to enable access to setHeader and on('close')
app.get('/api/events', (req: any, res: any) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  if (res.flushHeaders) {
    res.flushHeaders();
  }

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

function broadcastEvent(type: string, data: any) {
  const payload = JSON.stringify({ type, data });
  sseClients.forEach(client => {
    client.res.write(`data: ${payload}\n\n`);
  });
}

/**
 * WEBHOOKS & OTHER ROUTES
 */
// Fixed: Cast rawBodyMiddleware to any and use any for req/res
app.post('/webhooks/shopify/orders_create', rawBodyMiddleware, (req: any, res: any) => {
  // Fixed: Cast to any as Buffer type might not be available in all environments
  const rawBody = req.body as any;
  const hmacHeader = req.headers['x-shopify-hmac-sha256'] as string;
  const generatedHash = crypto.createHmac('sha256', SHOPIFY_WEBHOOK_SECRET).update(rawBody).digest('base64');
  if (generatedHash !== hmacHeader) return res.status(401).send();
  
  const order = JSON.parse(rawBody.toString());
  broadcastEvent('ORDER_CREATED', { orderId: order.id, orderNumber: order.name, amount: order.total_price });
  res.status(200).send('OK');
});

// Fixed: Cast express.json() to any and use any for req/res
app.post('/webhooks/wordpress/event', express.json() as any, (req: any, res: any) => {
  const secretHeader = req.headers['x-opspilot-wp-secret'];
  if (secretHeader !== WP_WEBHOOK_SECRET) return res.status(401).json({ error: 'Unauthorized' });

  const payload = req.body;
  broadcastEvent('WORDPRESS_EVENT', {
    action: payload.action || 'generic',
    title: payload.title || 'WP Activity',
    details: payload.details || 'New event captured.'
  });

  res.status(200).json({ status: 'success' });
});

app.listen(3001, () => console.log('OpsPilot Backend running on port 3001'));

import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { MCPMessage, MessageType, ModelContext, QueryPayload, ResponsePayload, ErrorPayload } from './types/mcp';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Store active contexts
const contexts = new Map<string, ModelContext>();

// WebSocket connection handler
wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected');

  ws.on('message', async (message: Buffer) => {
    try {
      const mcpMessage: MCPMessage = JSON.parse(message.toString());
      await handleMessage(ws, mcpMessage);
    } catch (error: unknown) {
      console.error('Error processing message:', error);
      sendError(ws, {
        code: 'INVALID_MESSAGE',
        message: 'Failed to process message',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

async function handleMessage(ws: WebSocket, message: MCPMessage) {
  switch (message.type) {
    case MessageType.INIT:
      await handleInit(ws, message);
      break;
    case MessageType.QUERY:
      await handleQuery(ws, message);
      break;
    case MessageType.CONTEXT_UPDATE:
      await handleContextUpdate(ws, message);
      break;
    default:
      sendError(ws, {
        code: 'UNKNOWN_MESSAGE_TYPE',
        message: `Unknown message type: ${message.type}`
      });
  }
}

async function handleInit(ws: WebSocket, message: MCPMessage) {
  const context: ModelContext = message.context || {
    modelId: 'default-model',
    parameters: {},
    history: []
  };
  
  contexts.set(ws.id, context);
  
  sendResponse(ws, {
    type: MessageType.INIT,
    payload: { status: 'initialized', context }
  });
}

async function handleQuery(ws: WebSocket, message: MCPMessage) {
  const context = contexts.get(ws.id);
  if (!context) {
    sendError(ws, {
      code: 'NO_CONTEXT',
      message: 'No active context found. Please initialize first.'
    });
    return;
  }

  const queryPayload = message.payload as QueryPayload;
  
  // Simulate model processing
  const response: ResponsePayload = {
    text: `Processed query: ${queryPayload.prompt}`,
    metadata: {
      tokens: 10,
      processingTime: 100,
      model: context.modelId
    }
  };

  // Update context history
  context.history.push({
    role: 'user',
    content: queryPayload.prompt,
    timestamp: Date.now()
  });

  context.history.push({
    role: 'assistant',
    content: response.text,
    timestamp: Date.now()
  });

  sendResponse(ws, {
    type: MessageType.RESPONSE,
    payload: response,
    context
  });
}

async function handleContextUpdate(ws: WebSocket, message: MCPMessage) {
  const context = contexts.get(ws.id);
  if (!context) {
    sendError(ws, {
      code: 'NO_CONTEXT',
      message: 'No active context found. Please initialize first.'
    });
    return;
  }

  const newContext = message.context;
  if (newContext) {
    contexts.set(ws.id, newContext);
    sendResponse(ws, {
      type: MessageType.CONTEXT_UPDATE,
      payload: { status: 'updated' },
      context: newContext
    });
  }
}

function sendResponse(ws: WebSocket, message: MCPMessage) {
  ws.send(JSON.stringify(message));
}

function sendError(ws: WebSocket, error: ErrorPayload) {
  sendResponse(ws, {
    type: MessageType.ERROR,
    payload: error
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
}); 
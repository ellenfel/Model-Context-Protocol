import WebSocket from 'ws';
import { MCPMessage, MessageType, ModelContext, QueryPayload } from './types/mcp';

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
  console.log('Connected to MCP server');
  
  // Initialize context
  const initMessage: MCPMessage = {
    type: MessageType.INIT,
    payload: {},
    context: {
      modelId: 'test-model',
      parameters: {
        temperature: 0.7,
        maxTokens: 100
      },
      history: []
    }
  };
  
  ws.send(JSON.stringify(initMessage));
});

ws.on('message', (data: Buffer) => {
  const message: MCPMessage = JSON.parse(data.toString());
  
  switch (message.type) {
    case MessageType.INIT:
      console.log('Context initialized:', message.payload);
      // Send a test query after initialization
      sendTestQuery();
      break;
    case MessageType.RESPONSE:
      console.log('Received response:', message.payload);
      break;
    case MessageType.ERROR:
      console.error('Received error:', message.payload);
      break;
    default:
      console.log('Received message:', message);
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', () => {
  console.log('Disconnected from MCP server');
});

function sendTestQuery() {
  const queryMessage: MCPMessage = {
    type: MessageType.QUERY,
    payload: {
      prompt: 'Hello, how are you?',
      options: {
        temperature: 0.7,
        maxTokens: 50
      }
    } as QueryPayload
  };
  
  ws.send(JSON.stringify(queryMessage));
} 
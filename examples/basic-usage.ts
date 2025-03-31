import WebSocket from 'ws';
import { MCPMessage, MessageType, QueryPayload } from '../src/types/mcp';

// Create WebSocket connection
const ws = new WebSocket('ws://localhost:3000');

// Handle connection open
ws.on('open', () => {
  console.log('Connected to MCP server');
  
  // Initialize the context
  const initMessage: MCPMessage = {
    type: MessageType.INIT,
    payload: {},
    context: {
      modelId: 'example-model',
      parameters: {
        temperature: 0.7,
        maxTokens: 100
      },
      history: []
    }
  };
  
  ws.send(JSON.stringify(initMessage));
});

// Handle incoming messages
ws.on('message', (data: Buffer) => {
  const message: MCPMessage = JSON.parse(data.toString());
  
  switch (message.type) {
    case MessageType.INIT:
      console.log('Context initialized:', message.payload);
      // Send a test query after initialization
      sendQuery('What is the capital of France?');
      break;
    case MessageType.RESPONSE:
      console.log('Model response:', message.payload.text);
      // Send a follow-up query
      sendQuery('Tell me more about it.');
      break;
    case MessageType.ERROR:
      console.error('Error:', message.payload);
      break;
    default:
      console.log('Received message:', message);
  }
});

// Handle errors
ws.on('error', (error: Error) => {
  console.error('WebSocket error:', error);
});

// Handle connection close
ws.on('close', () => {
  console.log('Disconnected from MCP server');
});

// Function to send queries
function sendQuery(prompt: string) {
  const queryMessage: MCPMessage = {
    type: MessageType.QUERY,
    payload: {
      prompt,
      options: {
        temperature: 0.7,
        maxTokens: 50
      }
    } as QueryPayload
  };
  
  ws.send(JSON.stringify(queryMessage));
} 
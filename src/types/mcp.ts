export interface MCPMessage {
  type: MessageType;
  payload: any;
  context?: ModelContext;
}

export enum MessageType {
  INIT = 'init',
  QUERY = 'query',
  RESPONSE = 'response',
  ERROR = 'error',
  CONTEXT_UPDATE = 'context_update'
}

export interface ModelContext {
  modelId: string;
  parameters: Record<string, any>;
  history: MessageHistory[];
}

export interface MessageHistory {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface QueryPayload {
  prompt: string;
  options?: QueryOptions;
}

export interface QueryOptions {
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

export interface ResponsePayload {
  text: string;
  metadata?: {
    tokens: number;
    processingTime: number;
    model: string;
  };
}

export interface ErrorPayload {
  code: string;
  message: string;
  details?: any;
} 
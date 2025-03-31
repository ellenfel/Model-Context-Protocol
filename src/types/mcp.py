from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

class MessageType(str, Enum):
    INIT = "init"
    QUERY = "query"
    RESPONSE = "response"
    ERROR = "error"
    CONTEXT_UPDATE = "context_update"

class MessageHistory(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: float

class ModelContext(BaseModel):
    model_id: str
    parameters: Dict[str, Any]
    history: List[MessageHistory]

class QueryOptions(BaseModel):
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    stop_sequences: Optional[List[str]] = None

class QueryPayload(BaseModel):
    prompt: str
    options: Optional[QueryOptions] = None

class ResponseMetadata(BaseModel):
    tokens: int
    processing_time: float
    model: str

class ResponsePayload(BaseModel):
    text: str
    metadata: Optional[ResponseMetadata] = None

class ErrorPayload(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None

class MCPMessage(BaseModel):
    type: MessageType
    payload: Any
    context: Optional[ModelContext] = None 
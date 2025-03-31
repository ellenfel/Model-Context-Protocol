import asyncio
import json
from typing import Dict, Optional
from fastapi import FastAPI, WebSocket
from .types.mcp import (
    MCPMessage, MessageType, ModelContext, QueryPayload,
    ResponsePayload, ErrorPayload, MessageHistory
)

app = FastAPI()

# Store active contexts
contexts: Dict[str, ModelContext] = {}

async def handle_init(websocket: WebSocket, message: MCPMessage) -> None:
    context = message.context or ModelContext(
        model_id="default-model",
        parameters={},
        history=[]
    )
    
    contexts[websocket.client_state.id] = context
    
    response = MCPMessage(
        type=MessageType.INIT,
        payload={"status": "initialized", "context": context},
        context=context
    )
    await websocket.send_json(response.model_dump())

async def handle_query(websocket: WebSocket, message: MCPMessage) -> None:
    context = contexts.get(websocket.client_state.id)
    if not context:
        error = ErrorPayload(
            code="NO_CONTEXT",
            message="No active context found. Please initialize first."
        )
        await websocket.send_json(MCPMessage(
            type=MessageType.ERROR,
            payload=error
        ).model_dump())
        return

    query_payload = QueryPayload(**message.payload)
    
    # Simulate model processing
    response_payload = ResponsePayload(
        text=f"Processed query: {query_payload.prompt}",
        metadata={
            "tokens": 10,
            "processing_time": 100,
            "model": context.model_id
        }
    )

    # Update context history
    context.history.append(MessageHistory(
        role="user",
        content=query_payload.prompt,
        timestamp=asyncio.get_event_loop().time()
    ))

    context.history.append(MessageHistory(
        role="assistant",
        content=response_payload.text,
        timestamp=asyncio.get_event_loop().time()
    ))

    response = MCPMessage(
        type=MessageType.RESPONSE,
        payload=response_payload,
        context=context
    )
    await websocket.send_json(response.model_dump())

async def handle_context_update(websocket: WebSocket, message: MCPMessage) -> None:
    context = contexts.get(websocket.client_state.id)
    if not context:
        error = ErrorPayload(
            code="NO_CONTEXT",
            message="No active context found. Please initialize first."
        )
        await websocket.send_json(MCPMessage(
            type=MessageType.ERROR,
            payload=error
        ).model_dump())
        return

    if message.context:
        contexts[websocket.client_state.id] = message.context
        response = MCPMessage(
            type=MessageType.CONTEXT_UPDATE,
            payload={"status": "updated"},
            context=message.context
        )
        await websocket.send_json(response.model_dump())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print(f"New client connected: {websocket.client_state.id}")

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = MCPMessage.model_validate_json(data)
                
                if message.type == MessageType.INIT:
                    await handle_init(websocket, message)
                elif message.type == MessageType.QUERY:
                    await handle_query(websocket, message)
                elif message.type == MessageType.CONTEXT_UPDATE:
                    await handle_context_update(websocket, message)
                else:
                    error = ErrorPayload(
                        code="UNKNOWN_MESSAGE_TYPE",
                        message=f"Unknown message type: {message.type}"
                    )
                    await websocket.send_json(MCPMessage(
                        type=MessageType.ERROR,
                        payload=error
                    ).model_dump())

            except Exception as e:
                error = ErrorPayload(
                    code="INVALID_MESSAGE",
                    message="Failed to process message",
                    details=str(e)
                )
                await websocket.send_json(MCPMessage(
                    type=MessageType.ERROR,
                    payload=error
                ).model_dump())

    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        print(f"Client disconnected: {websocket.client_state.id}")
        contexts.pop(websocket.client_state.id, None)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000) 
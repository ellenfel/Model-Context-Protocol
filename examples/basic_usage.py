import asyncio
import json
import websockets
from typing import Dict, Any
from src.types.mcp import (
    MCPMessage, MessageType, ModelContext, QueryPayload,
    QueryOptions, MessageHistory
)

async def send_query(websocket, prompt: str) -> None:
    query_message = MCPMessage(
        type=MessageType.QUERY,
        payload=QueryPayload(
            prompt=prompt,
            options=QueryOptions(
                temperature=0.7,
                max_tokens=50
            )
        )
    )
    await websocket.send(json.dumps(query_message.model_dump()))

async def main():
    uri = "ws://localhost:3000/ws"
    
    async with websockets.connect(uri) as websocket:
        print("Connected to MCP server")
        
        # Initialize context
        init_message = MCPMessage(
            type=MessageType.INIT,
            payload={},
            context=ModelContext(
                model_id="example-model",
                parameters={
                    "temperature": 0.7,
                    "max_tokens": 100
                },
                history=[]
            )
        )
        
        await websocket.send(json.dumps(init_message.model_dump()))
        
        try:
            while True:
                response = await websocket.recv()
                message = MCPMessage.model_validate_json(response)
                
                if message.type == MessageType.INIT:
                    print("Context initialized:", message.payload)
                    # Send a test query after initialization
                    await send_query(websocket, "What is the capital of France?")
                elif message.type == MessageType.RESPONSE:
                    print("Model response:", message.payload["text"])
                    # Send a follow-up query
                    await send_query(websocket, "Tell me more about it.")
                elif message.type == MessageType.ERROR:
                    print("Error:", message.payload)
                else:
                    print("Received message:", message)
                    
        except websockets.exceptions.ConnectionClosed:
            print("Connection closed")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main()) 
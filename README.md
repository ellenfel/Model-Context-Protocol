# Model Context Protocol (MCP) Server

A basic implementation of a Model Context Protocol server for educational purposes. This server demonstrates the core concepts of MCP and how to implement them in practice using Python.

## Features

- WebSocket-based communication using FastAPI and WebSockets
- Basic MCP message handling with Pydantic models
- Support for model context management
- Simple client-server interaction
- Async/await support for better performance

## Getting Started

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the development server:
```bash
python -m src.server
```

4. Run the example client:
```bash
python examples/basic_usage.py
```

## Project Structure

```
src/
├── server.py          # Main server implementation
├── types/            # TypeScript type definitions
│   └── mcp.py        # MCP protocol types using Pydantic
└── examples/         # Example implementations
    └── basic_usage.py # Basic client example
```

## MCP Protocol Overview

The Model Context Protocol (MCP) is a communication protocol designed for AI model interactions. This implementation includes:

- Message format handling using Pydantic models
- Context management
- Basic protocol operations
- Async/await support for better performance

## Key Differences from TypeScript Version

1. Uses FastAPI instead of Express
2. Implements async/await for better performance
3. Uses Pydantic for data validation and serialization
4. More Pythonic code structure and patterns
MIT

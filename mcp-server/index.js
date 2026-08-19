import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { tools, handleTool } from "./tools.js";

const server = new Server(
  { name: "adobe-bridge", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  return handleTool(req.params);
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[adobe-bridge] MCP server running on stdio");

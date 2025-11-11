#!/usr/bin/env -S deno run --allow-net --allow-env

import { McpServer } from "npm:@modelcontextprotocol/sdk@1.21.1/server/mcp.js";
import { StdioServerTransport } from "npm:@modelcontextprotocol/sdk@1.21.1/server/stdio.js";
import { registerApiTool } from "./src/tools/api.ts";
import {
  registerExecuteQueryTool,
  registerListDatabasesTool,
} from "./src/tools/databases.ts";
import {
  registerGetTableFieldsTool,
  registerListTablesTool,
} from "./src/tools/tables.ts";
import {
  registerCreateCardTool,
  registerExecuteCardTool,
  registerListCardsTool,
} from "./src/tools/questions.ts";
import {
  registerCreateCollectionTool,
  registerListCollectionsTool,
} from "./src/tools/collections.ts";
import { registerAppendCardToDashboardTool } from "./src/tools/dashboards.ts";

const server = new McpServer({
  name: "metabase-mcp",
  version: "1.0.0",
});

registerApiTool(server);
registerListDatabasesTool(server);
registerListTablesTool(server);
registerGetTableFieldsTool(server);
registerExecuteQueryTool(server);
registerListCardsTool(server);
registerExecuteCardTool(server);
registerCreateCardTool(server);
registerListCollectionsTool(server);
registerCreateCollectionTool(server);
registerAppendCardToDashboardTool(server);

const transport = new StdioServerTransport();
await server.connect(transport);

console.error("Metabase MCP Server running on stdio");

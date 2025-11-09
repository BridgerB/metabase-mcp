import { z } from "npm:zod@3.23.8";
import { McpServer } from "npm:@modelcontextprotocol/sdk@1.21.1/server/mcp.js";
import { metabaseApiCall } from "../client.ts";
import type { DatabaseMetadata, TableMetadata } from "../types.ts";

const listTablesSchema = z.object({
  database_id: z.number().describe(
    "The ID of the database to list tables from",
  ),
});

export function registerListTablesTool(server: McpServer): void {
  server.registerTool(
    "list_tables",
    {
      title: "List Metabase Tables",
      description: "Get a list of all tables in a specific database",
      inputSchema: listTablesSchema.shape,
    },
    async (args: z.infer<typeof listTablesSchema>) => {
      const { database_id } = args;
      const metadata = await metabaseApiCall(
        "GET",
        `api/database/${database_id}/metadata`,
      ) as DatabaseMetadata;
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(metadata.tables),
        }],
      };
    },
  );
}

const getTableFieldsSchema = z.object({
  table_id: z.number().describe("The ID of the table to get fields from"),
});

export function registerGetTableFieldsTool(server: McpServer): void {
  server.registerTool(
    "get_table_fields",
    {
      title: "Get Metabase Table Fields",
      description: "Get field metadata for a specific table",
      inputSchema: getTableFieldsSchema.shape,
    },
    async (args: z.infer<typeof getTableFieldsSchema>) => {
      const { table_id } = args;
      const metadata = await metabaseApiCall(
        "GET",
        `api/table/${table_id}/query_metadata`,
      ) as TableMetadata;
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(metadata.fields),
        }],
      };
    },
  );
}

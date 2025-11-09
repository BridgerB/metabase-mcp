import { z } from "npm:zod@3.23.8";
import { McpServer } from "npm:@modelcontextprotocol/sdk@1.21.1/server/mcp.js";
import { metabaseApiCall } from "../client.ts";
import type {
  MetabaseDatabase,
  QueryParameter,
  QueryResult,
  TemplateTag,
} from "../types.ts";

export function registerListDatabasesTool(server: McpServer): void {
  server.registerTool(
    "list_databases",
    {
      title: "List Metabase Databases",
      description: "Get a list of all databases configured in Metabase",
      inputSchema: {},
    },
    async () => {
      const response = await metabaseApiCall("GET", "api/database") as {
        data: MetabaseDatabase[];
      };
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(response.data || response),
        }],
      };
    },
  );
}

const parameterSchema = z.object({
  type: z.string().describe(
    "Parameter type: 'text', 'number', 'date', or 'category'",
  ),
  target: z.array(z.unknown()).describe(
    "Parameter target in template-tag format: ['variable', ['template-tag', 'param_name']]",
  ),
  value: z.unknown().describe("The parameter value"),
});

const executeQuerySchema = z.object({
  database_id: z.number().describe(
    "The database ID to execute the query against",
  ),
  query: z.string().describe(
    "The SQL query to execute (use {{param_name}} for template parameters)",
  ),
  parameters: z.array(parameterSchema).optional().describe(
    "Optional query parameters for parameterized queries",
  ),
});

export function registerExecuteQueryTool(server: McpServer): void {
  server.registerTool(
    "execute_query",
    {
      title: "Execute Metabase SQL Query",
      description:
        "Execute an ad-hoc SQL query against a Metabase database. Supports parameterized queries using {{param_name}} syntax.",
      inputSchema: executeQuerySchema.shape,
    },
    async (args: z.infer<typeof executeQuerySchema>) => {
      const { database_id, query, parameters } = args;

      const requestBody: {
        database: number;
        type: string;
        native: {
          query: string;
          "template-tags": Record<string, TemplateTag>;
        };
        parameters?: QueryParameter[];
      } = {
        database: database_id,
        type: "native",
        native: {
          query: query,
          "template-tags": {},
        },
      };

      if (parameters && parameters.length > 0) {
        requestBody.parameters = parameters as QueryParameter[];

        for (const param of parameters) {
          if (
            param.target && param.target.length === 2 &&
            param.target[0] === "variable" &&
            Array.isArray(param.target[1]) &&
            param.target[1][0] === "template-tag"
          ) {
            const tagName = param.target[1][1];
            requestBody.native["template-tags"][tagName] = {
              type: param.type,
              name: tagName,
              "display-name": tagName,
              id: tagName,
            };
          }
        }
      }

      const result = await metabaseApiCall(
        "POST",
        "api/dataset",
        requestBody,
      ) as QueryResult;
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(result),
        }],
      };
    },
  );
}

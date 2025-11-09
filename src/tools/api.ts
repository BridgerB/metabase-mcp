import { z } from "npm:zod@3.23.8";
import { McpServer } from "npm:@modelcontextprotocol/sdk@1.21.1/server/mcp.js";
import { metabaseApiCall } from "../client.ts";

const apiSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).describe(
    "HTTP method for the API call",
  ),
  endpoint: z.string().describe(
    "API endpoint path (e.g., 'api/dashboard/34' or 'api/card/551')",
  ),
  body: z.unknown().optional().describe(
    "Optional request body for POST/PUT/PATCH requests",
  ),
  params: z.record(z.string(), z.string()).optional().describe(
    "Optional query parameters as key-value pairs",
  ),
});

export function registerApiTool(server: McpServer): void {
  server.registerTool(
    "api",
    {
      title: "Metabase Raw API",
      description:
        "Execute raw Metabase API calls. Supports GET, POST, PUT, DELETE, PATCH methods. Use for operations not covered by specialized tools.",
      inputSchema: apiSchema.shape,
    },
    async (args: z.infer<typeof apiSchema>) => {
      const { method, endpoint, body, params } = args;
      const result = await metabaseApiCall(
        method,
        endpoint,
        body as Record<string, unknown> | undefined,
        params,
      );
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(result),
        }],
      };
    },
  );
}

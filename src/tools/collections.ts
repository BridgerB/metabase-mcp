import { z } from "npm:zod@3.23.8";
import { McpServer } from "npm:@modelcontextprotocol/sdk@1.21.1/server/mcp.js";
import { metabaseApiCall } from "../client.ts";
import type { MetabaseCollection } from "../types.ts";

export function registerListCollectionsTool(server: McpServer): void {
  server.registerTool(
    "list_collections",
    {
      title: "List Metabase Collections",
      description:
        "Get a list of all collections in Metabase. Collections are used to organize saved questions and dashboards.",
      inputSchema: {},
    },
    async () => {
      const response = await metabaseApiCall("GET", "api/collection") as {
        data: MetabaseCollection[];
      } | MetabaseCollection[];
      const collections = Array.isArray(response)
        ? response
        : (response as { data: MetabaseCollection[] }).data;

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(collections),
        }],
      };
    },
  );
}

const createCollectionSchema = z.object({
  name: z.string().describe("Name for the new collection"),
  description: z.string().optional().describe(
    "Optional description for the collection",
  ),
  color: z.string().optional().describe(
    "Optional color for the collection (e.g., '#509EE3')",
  ),
  parent_id: z.number().optional().describe(
    "Optional parent collection ID to nest this collection under",
  ),
});

export function registerCreateCollectionTool(server: McpServer): void {
  server.registerTool(
    "create_collection",
    {
      title: "Create Metabase Collection",
      description:
        "Create a new collection in Metabase to organize saved questions and dashboards.",
      inputSchema: createCollectionSchema.shape,
    },
    async (args: z.infer<typeof createCollectionSchema>) => {
      const { name, description, color, parent_id } = args;

      const collectionBody: {
        name: string;
        description?: string;
        color?: string;
        parent_id?: number;
      } = { name };

      if (description) {
        collectionBody.description = description;
      }

      if (color) {
        collectionBody.color = color;
      }

      if (parent_id !== undefined) {
        collectionBody.parent_id = parent_id;
      }

      const result = await metabaseApiCall(
        "POST",
        "api/collection",
        collectionBody,
      ) as MetabaseCollection;
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(result),
        }],
      };
    },
  );
}

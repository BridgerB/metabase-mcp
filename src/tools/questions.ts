import { z } from "npm:zod@3.23.8";
import { McpServer } from "npm:@modelcontextprotocol/sdk@1.21.1/server/mcp.js";
import { metabaseApiCall } from "../client.ts";
import type { DatasetQuery, MetabaseCard, QueryResult } from "../types.ts";

const listCardsSchema = z.object({
  collection_id: z.number().optional().describe(
    "Optional: Filter cards by collection ID",
  ),
});

export function registerListCardsTool(server: McpServer): void {
  server.registerTool(
    "list_cards",
    {
      title: "List Metabase Cards",
      description:
        "Get a list of saved questions (cards) in Metabase. Optionally filter by collection.",
      inputSchema: listCardsSchema.shape,
    },
    async (args: z.infer<typeof listCardsSchema>) => {
      const { collection_id } = args;
      const params: Record<string, string> = {};
      if (collection_id !== undefined) {
        params.collection = collection_id.toString();
      }

      const response = await metabaseApiCall(
        "GET",
        "api/card",
        undefined,
        params,
      ) as { data: MetabaseCard[] } | MetabaseCard[];
      const cards = Array.isArray(response)
        ? response
        : (response as { data: MetabaseCard[] }).data;

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(cards),
        }],
      };
    },
  );
}

const executeCardSchema = z.object({
  card_id: z.number().describe("The ID of the card to execute"),
  parameters: z.array(z.object({
    id: z.string().describe("Parameter ID from the card definition"),
    value: z.union([z.string(), z.number(), z.boolean(), z.null()]).describe(
      "The parameter value",
    ),
  })).optional().describe("Optional parameters for the card"),
});

export function registerExecuteCardTool(server: McpServer): void {
  server.registerTool(
    "execute_card",
    {
      title: "Execute Metabase Card",
      description:
        "Execute a saved question (card) by its ID. Supports passing parameters to parameterized cards.",
      inputSchema: executeCardSchema.shape,
    },
    async (args: z.infer<typeof executeCardSchema>) => {
      const { card_id, parameters } = args;

      const requestBody = parameters && parameters.length > 0
        ? { parameters }
        : undefined;
      const result = await metabaseApiCall(
        "POST",
        `api/card/${card_id}/query`,
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

const createCardSchema = z.object({
  name: z.string().describe("Name for the new card"),
  description: z.string().optional().describe(
    "Optional description for the card",
  ),
  database_id: z.number().describe("Database ID to query"),
  query: z.string().describe("SQL query string for the card"),
  display: z.enum(["table", "scalar", "line", "bar", "pie", "row"]).describe(
    "Visualization type",
  ),
  visualization_settings: z.record(
    z.string(),
    z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.string()),
      z.array(z.number()),
    ]),
  ).optional().describe("Optional visualization configuration"),
  collection_id: z.number().optional().describe(
    "Optional collection ID to save the card in",
  ),
});

export function registerCreateCardTool(server: McpServer): void {
  server.registerTool(
    "create_card",
    {
      title: "Create Metabase Card",
      description:
        "Create a new saved question (card) in Metabase with optional visualization settings.",
      inputSchema: createCardSchema.shape,
    },
    async (args: z.infer<typeof createCardSchema>) => {
      const {
        name,
        description,
        database_id,
        query,
        display,
        visualization_settings,
        collection_id,
      } = args;

      const cardBody: {
        name: string;
        display: string;
        dataset_query: DatasetQuery;
        visualization_settings: Record<string, unknown>;
        description?: string;
        collection_id?: number;
      } = {
        name,
        display,
        dataset_query: {
          database: database_id,
          type: "native",
          native: {
            query: query,
            "template-tags": {},
          },
        },
        visualization_settings: visualization_settings || {},
      };

      if (description) {
        cardBody.description = description;
      }

      if (collection_id !== undefined) {
        cardBody.collection_id = collection_id;
      }

      const result = await metabaseApiCall(
        "POST",
        "api/card",
        cardBody,
      ) as MetabaseCard;
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(result),
        }],
      };
    },
  );
}

import { z } from "npm:zod@3.23.8";
import { McpServer } from "npm:@modelcontextprotocol/sdk@1.21.1/server/mcp.js";
import { metabaseApiCall } from "../client.ts";

const appendCardToDashboardSchema = z.object({
  dashboard_id: z.number().describe("The ID of the dashboard to append to"),
  card_id: z.number().describe("The ID of the question/card to add"),
  size_x: z.number().optional().default(24).describe(
    "Width in grid units (default: 24 = full width)",
  ),
  size_y: z.number().optional().default(8).describe(
    "Height in grid units (default: 8)",
  ),
});

export function registerAppendCardToDashboardTool(server: McpServer): void {
  server.registerTool(
    "append_card_to_dashboard",
    {
      title: "Append Card to Dashboard",
      description:
        "Append a question/card to the bottom of a dashboard. Automatically handles positioning and preserves existing cards.",
      inputSchema: appendCardToDashboardSchema.shape,
    },
    async (args: z.infer<typeof appendCardToDashboardSchema>) => {
      const { dashboard_id, card_id, size_x, size_y } = args;

      try {
        // 1. Get current dashboard state
        const dashboard = await metabaseApiCall(
          "GET",
          `api/dashboard/${dashboard_id}`,
        ) as {
          dashcards: Array<{
            id: number;
            card_id: number;
            dashboard_tab_id: number | null;
            row: number;
            col: number;
            size_x: number;
            size_y: number;
            parameter_mappings: unknown[];
            series: unknown[];
          }>;
          tabs?: Array<{ id: number; name: string; position: number }>;
        };

        // 2. Preserve all existing dashcards
        const existingCards = dashboard.dashcards.map((dc) => ({
          id: dc.id,
          card_id: dc.card_id,
          dashboard_tab_id: dc.dashboard_tab_id,
          row: dc.row,
          col: dc.col,
          size_x: dc.size_x,
          size_y: dc.size_y,
          parameter_mappings: dc.parameter_mappings || [],
          series: dc.series || [],
        }));

        // 3. Calculate next available row position
        const maxRow = existingCards.reduce((max, card) => {
          const cardBottom = card.row + card.size_y;
          return cardBottom > max ? cardBottom : max;
        }, 0);

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              success: true,
              message:
                `Successfully added card ${card_id} to dashboard ${dashboard_id}`,
              position: {
                row: maxRow,
                col: 0,
                size_x: size_x,
                size_y: size_y,
              },
              total_cards: existingCards.length + 1,
            }),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : String(error),
            }),
          }],
        };
      }
    },
  );
}

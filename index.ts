import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const base_url = "https://wallet-analyzer-lovat.vercel.app";

// Create an MCP server
const server = new McpServer({
    name: "Solana Wallet Analyzer",
    version: "0.1.0",
});

// Parse transactions
server.tool(
    "parseTransactions",
    "Parse transactions to human readable format from the transaction signature",
    { signatures: z.array(z.string()) },
    async ({ signatures }) => {
        try {

            const response = await fetch(`${base_url}/api/transactions`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({signatures: signatures})
              });

              const data = await response.json();


            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error: ${(error as Error).message}` }]
            };
        }
    }
);

// Query pnls
server.tool(
    "queryPnls",
    "Query Pnls of wallet(s) on token(s)",
    { params: z.object({
        filter: z.object({
            wallet: z.string().optional(),
            token: z.string().optional(),
          }).catchall(z.any())
            .describe("Filters like token/wallet")
            .default({}),
        
        limit: z.number()
          .describe("Maximum documents to return")
          .min(1)
          .max(1000)
          .default(10),
        
        projection: z.record(z.any())
          .describe("Fields to include/exclude")
          .default({}),
        
        sort: z.record(z.any())
          .describe("Sort elements by either usd or pnl in ascending or descending order")
          .default({})
      }) },
    async ({ params }) => {
        try {

            const response = await fetch(`${base_url}/api/pnl`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(params)
              });

              const data = await response.json();


            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error: ${(error as Error).message}` }]
            };
        }
    }
);

// get token details from mint
server.tool(
    "getTokenDetailsFromMints",
    "Get token details from mint(s) like name/symbol to be use alongside the mint when mentionning the token",
    { params: z.object({
        mints: z.array(z.string())
        
      }) },
    async ({ params }) => {
        try {

            const response = await fetch(`${base_url}/api/tokens`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(params)
              });

              const data = await response.json();


            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error: ${(error as Error).message}` }]
            };
        }
    }
);

// get token mint from name/symbol
server.tool(
    "getTokenMint",
    `Get token mint from name or symbol, if result is unique then get the mint otherwise return the list
    of tokens (mint, name, symbol) for the user to choose from`,
    { params: z.object({
        name: z.string().optional()
        
      }) },
    async ({ params }) => {
        try {

            const response = await fetch(`${base_url}/api/tokens/search`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(params)
              });

              const data = await response.json();


            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error: ${(error as Error).message}` }]
            };
        }
    }
);

// get token mint from name/symbol
server.tool(
    "getTopTokens",
    `Get top token by their pnls over all the wallets`,
    { params: z.object({
        limit: z.number(),
        minTrades: z.number()
      }) },
    async ({ params }) => {
        try {
            // Convert parameters to URL query string
            const queryParams = new URLSearchParams({
                limit: params.limit.toString(),
                minTrades: params.minTrades.toString()
            });

            // Append query parameters to the URL
            const url = `${base_url}/api/pnl/top-tokens?${queryParams.toString()}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                }
                // No body for GET request
            });

            const data = await response.json();

            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error: ${(error as Error).message}` }]
            };
        }
    }
);

server.tool(
    "getLeaderboard",
    `Get leaderboard of wallets by realised profit`,
    { params: z.object({
        limit: z.number()
      }) },
    async ({ params }) => {
        try {
            // Convert parameters to URL query string
            const queryParams = new URLSearchParams({
                limit: params.limit.toString()
            });

            // Append query parameters to the URL
            const url = `${base_url}/api/pnl/leaderboard?${queryParams.toString()}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                }
                // No body for GET request
            });

            const data = await response.json();

            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error: ${(error as Error).message}` }]
            };
        }
    }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
server.connect(transport);
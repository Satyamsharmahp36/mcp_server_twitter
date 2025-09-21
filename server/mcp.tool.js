import { config } from "dotenv";
import { TwitterApi } from "twitter-api-v2";
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { enhanceContent } from "./ai-content-enhancer.js";

config();

const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// Enhanced createPost function with AI content processing
export async function createPost(status, enhanceWithAI = true) {
    try {
        let finalContent = status;
        
        if (enhanceWithAI) {
            console.log("Original content:", status);
            finalContent = await enhanceContent(status);
            console.log("Enhanced content:", finalContent);
        }

        const newPost = await twitterClient.v2.tweet(finalContent);
        
        return {
            content: [{
                type: "text",
                text: `✅ Tweet Posted Successfully!\n\nOriginal: ${status}\n\nEnhanced: ${finalContent}\n\nTweet ID: ${newPost.data.id}`
            }]
        };
    } catch (error) {
        console.error("Twitter API Error:", error.data || error.message);
        return {
            content: [{
                type: "text", 
                text: `❌ Error: ${error.data?.detail || error.message}`
            }]
        };
    }
}

const server = new McpServer({
    name: "enhanced-twitter-server",
    version: "2.0.0"
});

const app = express();

// Keep your existing addTwoNumbers tool
server.tool(
    "addTwoNumbers",
    "Add two numbers",
    {
        a: z.number(),
        b: z.number()
    },
    async (arg) => {
        const { a, b } = arg;
        return {
            content: [
                {
                    type: "text",
                    text: `The sum of ${a} and ${b} is ${a + b}`
                }
            ]
        };
    }
);

// Enhanced Twitter post creation tool
server.tool(
    "createPost",
    "Create an AI-enhanced post on X (formerly Twitter). The content will be automatically enhanced with engaging language, emojis, and relevant hashtags.",
    {
        status: z.string().describe("The basic content you want to tweet about"),
        enhanceWithAI: z.boolean().optional().default(true).describe("Whether to enhance the content with AI (default: true)")
    },
    async (arg) => {
        const { status, enhanceWithAI = true } = arg;
        return createPost(status, enhanceWithAI);
    }
);

// New tool for content preview without posting
server.tool(
    "previewEnhancedContent",
    "Preview how your content will be enhanced by AI without posting to Twitter",
    {
        status: z.string().describe("The basic content to enhance")
    },
    async (arg) => {
        const { status } = arg;
        try {
            const enhancedContent = await enhanceContent(status);
            return {
                content: [{
                    type: "text",
                    text: `📝 Content Preview:\n\n🔸 Original: ${status}\n\n🔸 Enhanced: ${enhancedContent}\n\nCharacter count: ${enhancedContent.length}/280`
                }]
            };
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `❌ Preview Error: ${error.message}`
                }]
            };
        }
    }
);

const transports = {};

app.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport('/messages', res);
    transports[transport.sessionId] = transport;
    res.on("close", () => {
        delete transports[transport.sessionId];
    });
    await server.connect(transport);
});

app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId;
    const transport = transports[sessionId];
    if (transport) {
        await transport.handlePostMessage(req, res);
    } else {
        res.status(400).send('No transport found for sessionId');
    }
});

app.listen(3001, () => {
    console.log("🚀 Enhanced Twitter MCP Server running on http://localhost:3001");
    console.log("✨ AI content enhancement enabled with Gemini API");
});

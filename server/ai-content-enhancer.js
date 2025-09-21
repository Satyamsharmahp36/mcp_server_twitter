// ai-content-enhancer.js
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

export async function enhanceContent(originalContent) {
    try {
        const prompt = `
You are a professional social media content creator specializing in Twitter posts. Your task is to take a brief input and expand it into an engaging, well-structured tweet that maximizes engagement.

Guidelines:
- Expand the content with relevant details and context
- Add appropriate emojis to make it more engaging
- Include relevant hashtags (3-5 maximum)
- Keep it under 280 characters total
- Make it compelling and shareable
- Maintain the original message's intent
- Use engaging language that encourages interaction

Original content: "${originalContent}"

Create an enhanced tweet:`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7, // Creative but not too random
                maxOutputTokens: 100, // Keep it concise for Twitter
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Gemini API Error:", error);
        // Fallback to original content if AI fails
        return originalContent;
    }
}

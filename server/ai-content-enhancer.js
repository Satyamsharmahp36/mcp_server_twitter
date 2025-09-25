import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function enhanceContent(originalContent) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Gemini API Error:", error);
        // Fallback to original content if AI fails
        return originalContent;
    }
}

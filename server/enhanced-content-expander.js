// enhanced-content-expander.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class ContentExpander {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    }

    async expandToLongPost(originalContent) {
        const prompt = `
You are a professional social media content creator. Take this brief Twitter post and expand it into a compelling, longer social media post that tells a complete story.

Original post: "${originalContent}"

Create an expanded version that:
- Tells the complete story with context and background
- Adds personal insights and emotions
- Includes specific details about the achievement
- Mentions the journey/process
- Adds inspirational elements
- Uses engaging language with appropriate emojis
- Includes relevant hashtags (5-7 maximum)
- Maintains authenticity and excitement
- Keep it between 500-800 characters total

Format as a single cohesive post, not a thread.`;

        try {
            const result = await this.model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            console.error("Gemini API Error:", error);
            return originalContent;
        }
    }

    async expandToThread(originalContent) {
        const prompt = `
Create a Twitter thread (5-7 tweets) expanding this post. Each tweet should build on the previous one to tell a complete story.

Original post: "${originalContent}"

Structure:
1. Hook tweet (exciting announcement)
2. Background context (what is HackIndia)
3. Team introduction (who is Sankalp team)
4. Journey/process (how you got here)
5. What's next/excitement for finals
6. Inspirational closing with call to action
7. Thank you/hashtags

Each tweet must be under 270 characters. Number each tweet (1/7, 2/7, etc.). Use emojis and engaging language.`;

        try {
            const result = await this.model.generateContent(prompt);
            const thread = result.response.text().trim();
            return this.formatThread(thread);
        } catch (error) {
            console.error("Gemini API Error:", error);
            return [originalContent];
        }
    }

    async expandToLinkedInPost(originalContent) {
        const prompt = `
Transform this Twitter post into a professional LinkedIn post suitable for tech/startup community.

Original post: "${originalContent}"

Create a LinkedIn version that:
- Professional but enthusiastic tone
- Includes business/career insights
- Mentions team collaboration
- Discusses innovation and technology trends
- Adds value for professional network
- Uses professional emojis sparingly
- Includes relevant LinkedIn hashtags
- 300-500 words ideal length
- Starts with a compelling hook
- Ends with engagement question

Focus on the professional achievement and industry implications.`;

        try {
            const result = await this.model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            console.error("Gemini API Error:", error);
            return originalContent;
        }
    }

    formatThread(threadContent) {
        // Split the generated thread into individual tweets
        const tweets = threadContent
            .split(/\d+\/\d+/)
            .filter(tweet => tweet.trim().length > 0)
            .map((tweet, index, array) => {
                const cleanTweet = tweet.trim();
                return `${index + 1}/${array.length} ${cleanTweet}`;
            });
        
        return tweets;
    }
}

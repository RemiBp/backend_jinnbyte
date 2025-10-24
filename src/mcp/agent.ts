import OpenAI from "openai";
import { loadMCPConfig } from "./registry";
import { findNearbyRestaurants } from "./tool";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const config = loadMCPConfig();

const toolRegistry: Record<string, Function> = {
    find_nearby_restaurants: findNearbyRestaurants,
};

interface CopilotContext {
    userId: number;
    role: string;
    coords?: { latitude: number; longitude: number };
}

export const CopilotMCPAgent = {
    async run(query: string, ctx: CopilotContext) {
        const systemPrompt = `You are the ChoiceApp AI Copilot.

Be short, friendly, and natural — like a chat companion.
When tools are used, summarize results in 1–2 sentences max.

Tools available:
${config.tools.map(t => `- ${t.name}: ${t.description}`).join("\n")}

If the user asks about restaurants or nearby food, use "find_nearby_restaurants".
Return only JSON:
{"tool":"find_nearby_restaurants","params":{...}} or {"tool":"none"}.
`;

        // Decide whether to use a tool
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.2,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: query },
            ],
        });

        let parsed: any;
        try {
            parsed = JSON.parse(completion.choices[0].message?.content || "{}");
        } catch {
            parsed = { tool: "none" };
        }

        // If tool detected, run it
        if (parsed.tool && parsed.tool !== "none") {
            const fn = toolRegistry[parsed.tool];
            if (!fn) throw new Error(`No implementation for ${parsed.tool}`);

            const params = {
                latitude: ctx.coords?.latitude ?? 31.5204,
                longitude: ctx.coords?.longitude ?? 74.3587,
                radius_km: parsed.params?.radius_km ?? 10,
                ...parsed.params,
            };

            const data = await fn(params);

            // short message response for frontend
            return {
                tool: parsed.tool,
                message: `Here are some restaurants near you 🍽️`,
                data,
            };
        }

        // If no tool, just chat naturally
        const fallback = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.6,
            messages: [
                { role: "system", content: "You are a friendly, short-reply AI Copilot." },
                { role: "user", content: query },
            ],
        });

        return {
            tool: "none",
            message: fallback.choices[0].message?.content?.trim() ?? "I'm here to help!",
        };
    },
};

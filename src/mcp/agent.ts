// src/mcp/agent.ts
import OpenAI from "openai";
import { Agent, run, system, user } from "@openai/agents";
import { setDefaultOpenAIClient, OpenAIResponsesModel } from "@openai/agents-openai";
import { findNearbyRestaurants, findTopRatedNearby } from "./tool";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
setDefaultOpenAIClient(openai);

const AGENT_CONFIG = {
    name: "ChoiceApp Copilot",
    instructions: [
        "You are the official AI Copilot for ChoiceApp.",
        "CRITICAL: If the user asks for restaurants, MUST call one of:",
        "  - find_nearby_restaurants (for general nearby)",
        "  - find_top_rated_nearby (when the user mentions 'top', 'best', 'highest rated')",
        "Parameter filling rules:",
        "  - latitude := user context JSON at coords.latitude",
        "  - longitude := user context JSON at coords.longitude",
        "  - radius_km := (user context radius_km) OR default 5",
        "If any of latitude/longitude missing, respond asking the app to provide coords.",
        "Return the tool output directly as JSON: { message: string, data: any }.",
    ].join("\n"),
    toolUseBehavior: { stopAtToolNames: ["find_nearby_restaurants", "find_top_rated_nearby"] },
    model: new OpenAIResponsesModel(openai, "gpt-4.1-mini"),
    tools: [findNearbyRestaurants, findTopRatedNearby],
};

const agent = new Agent(AGENT_CONFIG);

function parseAgentResponse(response: unknown): { message: string; data: any } {
    if (response && typeof response === "object") {
        const r: any = response;
        if (typeof r.message === "string" && "data" in r) return r;
        return { message: JSON.stringify(r), data: null };
    }
    if (typeof response === "string") {
        const s = response.trim();
        try { return JSON.parse(s); } catch { return { message: s || "No structured response", data: null }; }
    }
    return { message: "No structured response", data: null };
}

export const CopilotAgent = {
    instance: agent,

    async handle(query: string, context: Record<string, any>) {
        const systemPrompt = [
            "You are the ChoiceApp Copilot.",
            "User context (JSON):",
            JSON.stringify(context, null, 2),
        ].join("\n");

        console.log(`🧠 [Copilot] Incoming query: "${query}"`);
        console.log("🗺️  Context coords:", context?.coords);

        const result = await run(agent, [system(systemPrompt), user(query)]);

        const toolRuns = (result as any)?.toolRuns;
        if (toolRuns?.length) {
            console.log("⚙️  Tools executed:");
            for (const runInfo of toolRuns) {
                console.log(`➡️  Tool: ${runInfo.toolName} | Duration: ${(runInfo.durationMs / 1000).toFixed(2)}s`);
                console.log("📦  Params:", runInfo.parameters);
            }
        } else {
            console.log("ℹ️  No tool executed, responded conversationally.");
        }

        // Prefer the tool's final output when short-circuited
        const final = (result as any)?.finalToolOutput ?? (result as any)?.finalOutput ?? "";
        return parseAgentResponse(final);
    },
};

import fs from "fs";
import yaml from "js-yaml";

export interface MCPTool {
    name: string;
    description: string;
    parameters: Record<string, string>;
    endpoint: string;
}

export interface MCPConfig {
    name: string;
    description: string;
    version: string;
    tools: MCPTool[];
}

export const loadMCPConfig = (path = "./src/copilot.yml"): MCPConfig => {
    const data = fs.readFileSync(path, "utf8");
    const parsed = yaml.load(data) as MCPConfig;
    if (!parsed?.tools?.length) throw new Error("Invalid MCP config file");
    return parsed;
};

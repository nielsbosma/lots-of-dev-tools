import type { ComponentType } from "react";

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  component: () => Promise<{ default: ComponentType }>;
}

export const toolRegistry: ToolDefinition[] = [
  {
    id: "url-encoder",
    name: "URL Encoder/Decoder",
    description: "Encode or decode URL components",
    category: "Encoding",
    component: () => import("./url-encoder/url-encoder"),
  },
  {
    id: "html-encoder",
    name: "HTML Encoder/Decoder",
    description: "Encode or decode HTML entities",
    category: "Encoding",
    component: () => import("./html-encoder/html-encoder"),
  },
  {
    id: "color-converter",
    name: "Color Converter",
    description: "Convert colors between HEX, RGB, and HSL",
    category: "Color",
    component: () => import("./color-converter/color-converter"),
  },
  {
    id: "case-converter",
    name: "Case Converter",
    description: "Convert text between camelCase, snake_case, kebab-case, PascalCase, CONSTANT_CASE, and Title Case",
    category: "Text",
    component: () => import("./case-converter/case-converter"),
  },
];

export function getToolById(id: string): ToolDefinition | undefined {
  return toolRegistry.find((t) => t.id === id);
}

export function getCategories(): string[] {
  return [...new Set(toolRegistry.map((t) => t.category))];
}

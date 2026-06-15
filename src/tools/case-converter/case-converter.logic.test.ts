import { describe, it, expect } from "vitest";
import {
  toWords,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  toPascalCase,
  toConstantCase,
  toTitleCase,
  detectCase,
} from "./case-converter.logic";

describe("toWords", () => {
  it("splits camelCase", () => {
    expect(toWords("helloWorld")).toEqual(["hello", "world"]);
  });

  it("splits PascalCase", () => {
    expect(toWords("HelloWorld")).toEqual(["hello", "world"]);
  });

  it("splits snake_case", () => {
    expect(toWords("hello_world")).toEqual(["hello", "world"]);
  });

  it("splits kebab-case", () => {
    expect(toWords("hello-world")).toEqual(["hello", "world"]);
  });

  it("splits Title Case", () => {
    expect(toWords("Hello World")).toEqual(["hello", "world"]);
  });

  it("handles single word", () => {
    expect(toWords("hello")).toEqual(["hello"]);
  });

  it("handles empty string", () => {
    expect(toWords("")).toEqual([]);
  });

  it("handles mixed case like XMLParser", () => {
    expect(toWords("XMLParser")).toEqual(["xml", "parser"]);
  });

  it("handles consecutive capitals like getHTTPResponse", () => {
    expect(toWords("getHTTPResponse")).toEqual(["get", "http", "response"]);
  });
});

describe("toCamelCase", () => {
  it("converts multi-word input", () => {
    expect(toCamelCase("hello_world")).toBe("helloWorld");
  });

  it("converts single word", () => {
    expect(toCamelCase("hello")).toBe("hello");
  });

  it("is idempotent for camelCase", () => {
    expect(toCamelCase("helloWorld")).toBe("helloWorld");
  });

  it("handles empty string", () => {
    expect(toCamelCase("")).toBe("");
  });

  it("converts XMLParser", () => {
    expect(toCamelCase("XMLParser")).toBe("xmlParser");
  });

  it("converts getHTTPResponse", () => {
    expect(toCamelCase("getHTTPResponse")).toBe("getHttpResponse");
  });
});

describe("toSnakeCase", () => {
  it("converts multi-word input", () => {
    expect(toSnakeCase("helloWorld")).toBe("hello_world");
  });

  it("converts single word", () => {
    expect(toSnakeCase("hello")).toBe("hello");
  });

  it("is idempotent for snake_case", () => {
    expect(toSnakeCase("hello_world")).toBe("hello_world");
  });

  it("handles empty string", () => {
    expect(toSnakeCase("")).toBe("");
  });

  it("converts XMLParser", () => {
    expect(toSnakeCase("XMLParser")).toBe("xml_parser");
  });
});

describe("toKebabCase", () => {
  it("converts multi-word input", () => {
    expect(toKebabCase("helloWorld")).toBe("hello-world");
  });

  it("converts single word", () => {
    expect(toKebabCase("hello")).toBe("hello");
  });

  it("is idempotent for kebab-case", () => {
    expect(toKebabCase("hello-world")).toBe("hello-world");
  });

  it("handles empty string", () => {
    expect(toKebabCase("")).toBe("");
  });

  it("converts XMLParser", () => {
    expect(toKebabCase("XMLParser")).toBe("xml-parser");
  });
});

describe("toPascalCase", () => {
  it("converts multi-word input", () => {
    expect(toPascalCase("hello_world")).toBe("HelloWorld");
  });

  it("converts single word", () => {
    expect(toPascalCase("hello")).toBe("Hello");
  });

  it("is idempotent for PascalCase", () => {
    expect(toPascalCase("HelloWorld")).toBe("HelloWorld");
  });

  it("handles empty string", () => {
    expect(toPascalCase("")).toBe("");
  });

  it("converts xml_parser", () => {
    expect(toPascalCase("xml_parser")).toBe("XmlParser");
  });
});

describe("toConstantCase", () => {
  it("converts multi-word input", () => {
    expect(toConstantCase("helloWorld")).toBe("HELLO_WORLD");
  });

  it("converts single word", () => {
    expect(toConstantCase("hello")).toBe("HELLO");
  });

  it("is idempotent for CONSTANT_CASE", () => {
    expect(toConstantCase("HELLO_WORLD")).toBe("HELLO_WORLD");
  });

  it("handles empty string", () => {
    expect(toConstantCase("")).toBe("");
  });

  it("converts XMLParser", () => {
    expect(toConstantCase("XMLParser")).toBe("XML_PARSER");
  });
});

describe("toTitleCase", () => {
  it("converts multi-word input", () => {
    expect(toTitleCase("hello_world")).toBe("Hello World");
  });

  it("converts single word", () => {
    expect(toTitleCase("hello")).toBe("Hello");
  });

  it("is idempotent for Title Case", () => {
    expect(toTitleCase("Hello World")).toBe("Hello World");
  });

  it("handles empty string", () => {
    expect(toTitleCase("")).toBe("");
  });

  it("converts XMLParser", () => {
    expect(toTitleCase("XMLParser")).toBe("Xml Parser");
  });
});

describe("detectCase", () => {
  it("detects camelCase", () => {
    expect(detectCase("helloWorld")).toBe("camelCase");
  });

  it("detects snake_case", () => {
    expect(detectCase("hello_world")).toBe("snake_case");
  });

  it("detects kebab-case", () => {
    expect(detectCase("hello-world")).toBe("kebab-case");
  });

  it("detects PascalCase", () => {
    expect(detectCase("HelloWorld")).toBe("PascalCase");
  });

  it("detects CONSTANT_CASE", () => {
    expect(detectCase("HELLO_WORLD")).toBe("CONSTANT_CASE");
  });

  it("detects Title Case", () => {
    expect(detectCase("Hello World")).toBe("Title Case");
  });

  it("returns empty for empty string", () => {
    expect(detectCase("")).toBe("empty");
  });

  it("returns unknown for mixed input", () => {
    expect(detectCase("hello_World-test")).toBe("unknown");
  });
});

import { describe, it, expect } from "vitest";
import { encodeUrl, decodeUrl } from "./url-encoder.logic";

describe("encodeUrl", () => {
  it("encodes special characters", () => {
    expect(encodeUrl("hello world")).toBe("hello%20world");
  });

  it("encodes ampersands and equals", () => {
    expect(encodeUrl("foo=bar&baz=qux")).toBe("foo%3Dbar%26baz%3Dqux");
  });

  it("leaves unreserved characters untouched", () => {
    expect(encodeUrl("hello-world_123")).toBe("hello-world_123");
  });

  it("encodes unicode characters", () => {
    expect(encodeUrl("café")).toBe("caf%C3%A9");
  });

  it("handles empty string", () => {
    expect(encodeUrl("")).toBe("");
  });
});

describe("decodeUrl", () => {
  it("decodes percent-encoded spaces", () => {
    expect(decodeUrl("hello%20world")).toBe("hello world");
  });

  it("decodes multiple encoded characters", () => {
    expect(decodeUrl("foo%3Dbar%26baz%3Dqux")).toBe("foo=bar&baz=qux");
  });

  it("handles already decoded strings", () => {
    expect(decodeUrl("hello")).toBe("hello");
  });

  it("decodes unicode", () => {
    expect(decodeUrl("caf%C3%A9")).toBe("café");
  });

  it("handles empty string", () => {
    expect(decodeUrl("")).toBe("");
  });

  it("throws on malformed input", () => {
    expect(() => decodeUrl("%E0%A4%A")).toThrow();
  });
});

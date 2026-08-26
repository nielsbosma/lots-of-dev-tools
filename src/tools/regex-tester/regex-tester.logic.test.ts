import { describe, it, expect } from "vitest";
import { runRegex, runReplace } from "./regex-tester.logic";

describe("runRegex", () => {
  it("matches a literal pattern with no flags", () => {
    const result = runRegex("world", "", "hello world");
    expect(result.error).toBeUndefined();
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].index).toBe(6);
    expect(result.matches[0].value).toBe("world");
  });

  it("returns every match with the g flag, at most one without it", () => {
    const withG = runRegex("o", "g", "foo boo moo");
    expect(withG.matches).toHaveLength(6);

    const withoutG = runRegex("o", "", "foo boo moo");
    expect(withoutG.matches).toHaveLength(1);
    expect(withoutG.matches[0].index).toBe(1);
  });

  it("populates numbered capture groups, with '' for non-participating ones", () => {
    const result = runRegex("(a)(b)?", "", "a");
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].groups).toEqual(["a", ""]);
  });

  it("populates named groups, and yields {} when the pattern has none", () => {
    const withNamed = runRegex("(?<year>\\d{4})-(?<month>\\d{2})", "", "2026-08");
    expect(withNamed.matches[0].named).toEqual({ year: "2026", month: "08" });

    const withoutNamed = runRegex("\\d+", "", "42");
    expect(withoutNamed.matches[0].named).toEqual({});
  });

  it("returns an error for an invalid pattern instead of throwing", () => {
    expect(() => runRegex("(", "", "abc")).not.toThrow();
    const result = runRegex("(", "", "abc");
    expect(result.error).toBeTruthy();
    expect(result.matches).toEqual([]);
  });

  it("terminates on a zero-length global match without hanging", () => {
    const result = runRegex("a*", "g", "bbb");
    expect(result.error).toBeUndefined();
    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.matches.every((m) => m.value === "")).toBe(true);
  });

  it("sets truncated when the match cap is exceeded", () => {
    const input = "a".repeat(10_001);
    const result = runRegex("a", "g", input);
    expect(result.truncated).toBe(true);
    expect(result.matches).toHaveLength(10_000);
  });

  it("does not truncate when under the cap", () => {
    const result = runRegex("a", "g", "aaa");
    expect(result.truncated).toBeUndefined();
    expect(result.matches).toHaveLength(3);
  });
});

describe("runReplace", () => {
  it("substitutes a $1 backreference", () => {
    const result = runReplace("(\\w+)@(\\w+)", "", "user@host", "$2:$1");
    expect(result.error).toBeUndefined();
    expect(result.result).toBe("host:user");
  });

  it("returns the input unchanged when there is no match", () => {
    const result = runReplace("xyz", "", "hello world", "!!!");
    expect(result.result).toBe("hello world");
  });

  it("returns an error for an invalid pattern instead of throwing", () => {
    expect(() => runReplace("(", "", "abc", "x")).not.toThrow();
    const result = runReplace("(", "", "abc", "x");
    expect(result.error).toBeTruthy();
  });
});

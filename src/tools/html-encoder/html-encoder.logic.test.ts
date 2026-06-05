import { describe, it, expect } from "vitest";
import { encodeHtml, decodeHtml } from "./html-encoder.logic";

describe("encodeHtml", () => {
  it("encodes angle brackets", () => {
    expect(encodeHtml("<div>")).toBe("&lt;div&gt;");
  });

  it("encodes ampersands", () => {
    expect(encodeHtml("&")).toBe("&amp;");
  });

  it("encodes quotes", () => {
    expect(encodeHtml('"quotes"')).toBe("&quot;quotes&quot;");
  });

  it("encodes single quotes", () => {
    expect(encodeHtml("'")).toBe("&#39;");
  });

  it("encodes all special characters together", () => {
    expect(encodeHtml('<a href="test" title=\'value\'>text & more</a>')).toBe(
      "&lt;a href=&quot;test&quot; title=&#39;value&#39;&gt;text &amp; more&lt;/a&gt;",
    );
  });

  it("handles empty string", () => {
    expect(encodeHtml("")).toBe("");
  });

  it("leaves plain text untouched", () => {
    expect(encodeHtml("hello world")).toBe("hello world");
  });
});

describe("decodeHtml", () => {
  it("decodes angle brackets", () => {
    expect(decodeHtml("&lt;div&gt;")).toBe("<div>");
  });

  it("decodes ampersands", () => {
    expect(decodeHtml("&amp;")).toBe("&");
  });

  it("decodes quotes", () => {
    expect(decodeHtml("&quot;quotes&quot;")).toBe('"quotes"');
  });

  it("decodes single quotes", () => {
    expect(decodeHtml("&#39;")).toBe("'");
  });

  it("decodes numeric entities", () => {
    expect(decodeHtml("&#60;")).toBe("<");
    expect(decodeHtml("&#x3C;")).toBe("<");
  });

  it("decodes mixed content", () => {
    expect(
      decodeHtml("&lt;a href=&quot;test&quot;&gt;text &amp; more&lt;/a&gt;"),
    ).toBe('<a href="test">text & more</a>');
  });

  it("handles nested entities", () => {
    expect(decodeHtml("&amp;lt;")).toBe("&lt;");
  });

  it("handles empty string", () => {
    expect(decodeHtml("")).toBe("");
  });

  it("handles plain text", () => {
    expect(decodeHtml("hello world")).toBe("hello world");
  });
});

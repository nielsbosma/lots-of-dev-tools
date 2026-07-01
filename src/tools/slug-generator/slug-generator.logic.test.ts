import { describe, it, expect } from "vitest";
import { toSlug, transliterate } from "./slug-generator.logic";

describe("transliterate", () => {
  it("should transliterate Latin-1 Supplement characters", () => {
    expect(transliterate("Héllo")).toBe("Hello");
    expect(transliterate("Café")).toBe("Cafe");
    expect(transliterate("naïve")).toBe("naive");
    expect(transliterate("Zürich")).toBe("Zurich");
    expect(transliterate("Tørshavn")).toBe("Torshavn");
  });

  it("should transliterate Latin Extended-A characters", () => {
    expect(transliterate("Łódź")).toBe("Lodz");
    expect(transliterate("Štruktura")).toBe("Struktura");
    expect(transliterate("Třeboň")).toBe("Trebon");
  });

  it("should handle characters without mapping", () => {
    expect(transliterate("Hello")).toBe("Hello");
    expect(transliterate("привет")).toBe("привет"); // Cyrillic unchanged
    expect(transliterate("こんにちは")).toBe("こんにちは"); // Japanese unchanged
  });

  it("should handle empty string", () => {
    expect(transliterate("")).toBe("");
  });
});

describe("toSlug", () => {
  it("should convert basic text to slug", () => {
    expect(toSlug("Hello World")).toBe("hello-world");
    expect(toSlug("The Quick Brown Fox")).toBe("the-quick-brown-fox");
  });

  it("should handle accented characters", () => {
    expect(toSlug("Crème brûlée")).toBe("creme-brulee");
    expect(toSlug("Héllo Wörld!")).toBe("hello-world");
    expect(toSlug("Café au lait")).toBe("cafe-au-lait");
  });

  it("should collapse multiple consecutive special characters to one separator", () => {
    expect(toSlug("Hello   World")).toBe("hello-world");
    expect(toSlug("foo---bar")).toBe("foo-bar");
    expect(toSlug("a!!!b???c")).toBe("a-b-c");
  });

  it("should trim leading and trailing special characters", () => {
    expect(toSlug("  Hello World  ")).toBe("hello-world");
    expect(toSlug("---foo---")).toBe("foo");
    expect(toSlug("!!!bar???")).toBe("bar");
  });

  it("should support custom separator", () => {
    expect(toSlug("Hello World", "_")).toBe("hello_world");
    expect(toSlug("Foo Bar Baz", "_")).toBe("foo_bar_baz");
  });

  it("should handle empty string", () => {
    expect(toSlug("")).toBe("");
  });

  it("should leave already-valid slug unchanged", () => {
    expect(toSlug("hello-world")).toBe("hello-world");
    expect(toSlug("foo-bar-baz")).toBe("foo-bar-baz");
  });

  it("should preserve numbers", () => {
    expect(toSlug("Plan 9")).toBe("plan-9");
    expect(toSlug("Version 1.2.3")).toBe("version-1-2-3");
  });

  it("should strip non-Latin scripts (Cyrillic/CJK)", () => {
    expect(toSlug("Hello привет")).toBe("hello");
    expect(toSlug("Hello こんにちは")).toBe("hello");
    expect(toSlug("Test 测试")).toBe("test");
  });

  it("should handle mixed special characters", () => {
    expect(toSlug("A & B | C")).toBe("a-b-c");
    expect(toSlug("hello@world.com")).toBe("hello-world-com");
  });

  it("should handle custom separator with special regex characters", () => {
    expect(toSlug("Hello World", ".")).toBe("hello.world");
    expect(toSlug("Foo Bar", "+")).toBe("foo+bar");
  });
});

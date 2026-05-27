import { describe, it, expect } from "vitest";
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  parseRgbString,
  parseHslString,
  formatRgb,
  formatHsl,
} from "./color-converter.logic";

describe("hexToRgb", () => {
  it("converts black", () => {
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("converts white", () => {
    expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("converts red", () => {
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("handles without hash", () => {
    expect(hexToRgb("ff8800")).toEqual({ r: 255, g: 136, b: 0 });
  });

  it("throws on invalid hex", () => {
    expect(() => hexToRgb("#gggggg")).toThrow("Invalid hex color");
  });

  it("throws on wrong length", () => {
    expect(() => hexToRgb("#fff")).toThrow("Invalid hex color");
  });
});

describe("rgbToHex", () => {
  it("converts black", () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe("#000000");
  });

  it("converts white", () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe("#ffffff");
  });

  it("clamps out-of-range values", () => {
    expect(rgbToHex({ r: 300, g: -10, b: 128 })).toBe("#ff0080");
  });
});

describe("rgbToHsl", () => {
  it("converts pure red", () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
  });

  it("converts pure green", () => {
    expect(rgbToHsl({ r: 0, g: 255, b: 0 })).toEqual({
      h: 120,
      s: 100,
      l: 50,
    });
  });

  it("converts gray (no saturation)", () => {
    expect(rgbToHsl({ r: 128, g: 128, b: 128 })).toEqual({
      h: 0,
      s: 0,
      l: 50,
    });
  });
});

describe("hslToRgb", () => {
  it("converts pure red", () => {
    expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({
      r: 255,
      g: 0,
      b: 0,
    });
  });

  it("converts gray", () => {
    expect(hslToRgb({ h: 0, s: 0, l: 50 })).toEqual({
      r: 128,
      g: 128,
      b: 128,
    });
  });

  it("roundtrips with rgbToHsl", () => {
    const original = { r: 100, g: 150, b: 200 };
    const hsl = rgbToHsl(original);
    const back = hslToRgb(hsl);
    expect(Math.abs(back.r - original.r)).toBeLessThanOrEqual(1);
    expect(Math.abs(back.g - original.g)).toBeLessThanOrEqual(1);
    expect(Math.abs(back.b - original.b)).toBeLessThanOrEqual(1);
  });
});

describe("parseRgbString", () => {
  it("parses valid rgb string", () => {
    expect(parseRgbString("rgb(255, 128, 0)")).toEqual({
      r: 255,
      g: 128,
      b: 0,
    });
  });

  it("throws on invalid format", () => {
    expect(() => parseRgbString("not a color")).toThrow();
  });
});

describe("parseHslString", () => {
  it("parses valid hsl string", () => {
    expect(parseHslString("hsl(120, 50%, 50%)")).toEqual({
      h: 120,
      s: 50,
      l: 50,
    });
  });

  it("parses without percent signs", () => {
    expect(parseHslString("hsl(120, 50, 50)")).toEqual({
      h: 120,
      s: 50,
      l: 50,
    });
  });

  it("throws on invalid format", () => {
    expect(() => parseHslString("not a color")).toThrow();
  });
});

describe("formatRgb", () => {
  it("formats rgb correctly", () => {
    expect(formatRgb({ r: 255, g: 128, b: 0 })).toBe("rgb(255, 128, 0)");
  });
});

describe("formatHsl", () => {
  it("formats hsl correctly", () => {
    expect(formatHsl({ h: 120, s: 50, l: 50 })).toBe("hsl(120, 50%, 50%)");
  });
});

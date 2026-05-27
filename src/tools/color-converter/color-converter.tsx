import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

export default function ColorConverter() {
  const [hex, setHex] = useState("#ff8800");
  const [rgb, setRgb] = useState("rgb(255, 136, 0)");
  const [hsl, setHsl] = useState("hsl(32, 100%, 50%)");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("#ff8800");

  function fromHex() {
    setError("");
    try {
      const rgbVal = hexToRgb(hex);
      const hslVal = rgbToHsl(rgbVal);
      setRgb(formatRgb(rgbVal));
      setHsl(formatHsl(hslVal));
      setPreview(hex.startsWith("#") ? hex : `#${hex}`);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function fromRgb() {
    setError("");
    try {
      const rgbVal = parseRgbString(rgb);
      const hexVal = rgbToHex(rgbVal);
      const hslVal = rgbToHsl(rgbVal);
      setHex(hexVal);
      setHsl(formatHsl(hslVal));
      setPreview(hexVal);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function fromHsl() {
    setError("");
    try {
      const hslVal = parseHslString(hsl);
      const rgbVal = hslToRgb(hslVal);
      const hexVal = rgbToHex(rgbVal);
      setHex(hexVal);
      setRgb(formatRgb(rgbVal));
      setPreview(hexVal);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div
        className="w-full h-16 border border-retro-border"
        style={{ backgroundColor: preview }}
        data-testid="color-preview"
      />

      {error && (
        <p className="text-retro-magenta text-sm" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Label htmlFor="hex-input">HEX</Label>
          <Input
            id="hex-input"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            placeholder="#ff8800"
          />
        </div>
        <Button onClick={fromHex}>Convert</Button>
      </div>

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Label htmlFor="rgb-input">RGB</Label>
          <Input
            id="rgb-input"
            value={rgb}
            onChange={(e) => setRgb(e.target.value)}
            placeholder="rgb(255, 136, 0)"
          />
        </div>
        <Button onClick={fromRgb}>Convert</Button>
      </div>

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Label htmlFor="hsl-input">HSL</Label>
          <Input
            id="hsl-input"
            value={hsl}
            onChange={(e) => setHsl(e.target.value)}
            placeholder="hsl(32, 100%, 50%)"
          />
        </div>
        <Button onClick={fromHsl}>Convert</Button>
      </div>
    </div>
  );
}

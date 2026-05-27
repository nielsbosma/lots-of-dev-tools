import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { encodeUrl, decodeUrl } from "./url-encoder.logic";

export default function UrlEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  function handleEncode() {
    setError("");
    setOutput(encodeUrl(input));
  }

  function handleDecode() {
    setError("");
    try {
      setOutput(decodeUrl(input));
    } catch {
      setError("Invalid encoded string");
      setOutput("");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="url-input">Input</Label>
        <Textarea
          id="url-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to encode or decode..."
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleEncode}>Encode</Button>
        <Button onClick={handleDecode}>Decode</Button>
      </div>

      {error && (
        <p className="text-retro-magenta text-sm" role="alert">
          {error}
        </p>
      )}

      <div>
        <Label htmlFor="url-output">Output</Label>
        <Textarea
          id="url-output"
          value={output}
          readOnly
          placeholder="Result will appear here..."
        />
      </div>
    </div>
  );
}

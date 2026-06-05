import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { encodeHtml, decodeHtml } from "./html-encoder.logic";

export default function HtmlEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  function handleEncode() {
    setOutput(encodeHtml(input));
  }

  function handleDecode() {
    setOutput(decodeHtml(input));
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="html-input">Input</Label>
        <Textarea
          id="html-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to encode or decode..."
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleEncode}>Encode</Button>
        <Button onClick={handleDecode}>Decode</Button>
      </div>

      <div>
        <Label htmlFor="html-output">Output</Label>
        <Textarea
          id="html-output"
          value={output}
          readOnly
          placeholder="Result will appear here..."
        />
      </div>
    </div>
  );
}

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toSlug } from "./slug-generator.logic";

export default function SlugGenerator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [separator, setSeparator] = useState<"-" | "_">("-");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function handleInputChange(value: string) {
    setInput(value);
    // Live conversion
    generateSlug(value, separator);
  }

  function generateSlug(text?: string, sep?: "-" | "_") {
    setError("");
    setCopied(false);
    try {
      const inputText = text ?? input;
      const separatorChar = sep ?? separator;
      if (!inputText) {
        setOutput("");
        return;
      }
      setOutput(toSlug(inputText, separatorChar));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function handleSeparatorChange(newSeparator: "-" | "_") {
    setSeparator(newSeparator);
    generateSlug(input, newSeparator);
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setError("Failed to copy to clipboard");
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-retro-magenta text-sm" role="alert">
          {error}
        </p>
      )}

      <div>
        <Label htmlFor="input-text">Input Text</Label>
        <Textarea
          id="input-text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Enter text to convert to a slug..."
          rows={4}
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Button onClick={() => generateSlug()}>Generate Slug</Button>
        <div className="flex gap-2 items-center">
          <span className="text-sm">Separator:</span>
          <Button
            onClick={() => handleSeparatorChange("-")}
            variant={separator === "-" ? "default" : "outline"}
          >
            -
          </Button>
          <Button
            onClick={() => handleSeparatorChange("_")}
            variant={separator === "_" ? "default" : "outline"}
          >
            _
          </Button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor="output-text">Slug</Label>
          {output && (
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          )}
        </div>
        <Textarea
          id="output-text"
          value={output}
          readOnly
          placeholder="Slug will appear here..."
          rows={4}
        />
      </div>
    </div>
  );
}

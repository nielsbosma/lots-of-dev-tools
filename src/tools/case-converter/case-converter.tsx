import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  toPascalCase,
  toConstantCase,
  toTitleCase,
  detectCase,
} from "./case-converter.logic";

export default function CaseConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [detectedCase, setDetectedCase] = useState("");

  function handleInputChange(value: string) {
    setInput(value);
    if (value) {
      setDetectedCase(detectCase(value));
    } else {
      setDetectedCase("");
    }
  }

  function convert(converterFn: (input: string) => string) {
    setError("");
    try {
      if (!input) {
        setOutput("");
        return;
      }
      setOutput(converterFn(input));
    } catch (e) {
      setError((e as Error).message);
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
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor="input-text">Input Text</Label>
          {detectedCase && (
            <span className="text-sm text-retro-muted">
              Detected: {detectedCase}
            </span>
          )}
        </div>
        <Textarea
          id="input-text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Enter text to convert..."
          rows={4}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => convert(toCamelCase)}>camelCase</Button>
        <Button onClick={() => convert(toSnakeCase)}>snake_case</Button>
        <Button onClick={() => convert(toKebabCase)}>kebab-case</Button>
        <Button onClick={() => convert(toPascalCase)}>PascalCase</Button>
        <Button onClick={() => convert(toConstantCase)}>CONSTANT_CASE</Button>
        <Button onClick={() => convert(toTitleCase)}>Title Case</Button>
      </div>

      <div>
        <Label htmlFor="output-text">Output</Label>
        <Textarea
          id="output-text"
          value={output}
          readOnly
          placeholder="Converted text will appear here..."
          rows={4}
        />
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { runRegex, runReplace } from "./regex-tester.logic";

const FLAG_OPTIONS = ["g", "i", "m", "s", "u", "y"] as const;
type Flag = (typeof FLAG_OPTIONS)[number];

interface Segment {
  text: string;
  matched: boolean;
}

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState<Record<Flag, boolean>>({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
    y: false,
  });
  const [testString, setTestString] = useState("");
  const [replacement, setReplacement] = useState("");
  const [copied, setCopied] = useState(false);

  const flagsString = FLAG_OPTIONS.filter((f) => flags[f]).join("");

  const result = useMemo(() => {
    if (!pattern || !testString) return null;
    return runRegex(pattern, flagsString, testString);
  }, [pattern, flagsString, testString]);

  const replaceResult = useMemo(() => {
    if (!pattern || !testString) return null;
    return runReplace(pattern, flagsString, testString, replacement);
  }, [pattern, flagsString, testString, replacement]);

  const highlighted = useMemo((): Segment[] | null => {
    if (!result || result.error || result.matches.length === 0) return null;
    const segments: Segment[] = [];
    let lastEnd = 0;
    for (const m of result.matches) {
      if (m.index > lastEnd) {
        segments.push({ text: testString.slice(lastEnd, m.index), matched: false });
      }
      segments.push({ text: m.value, matched: true });
      lastEnd = m.index + m.value.length;
    }
    if (lastEnd < testString.length) {
      segments.push({ text: testString.slice(lastEnd), matched: false });
    }
    return segments;
  }, [result, testString]);

  function toggleFlag(flag: Flag) {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  }

  async function copyReplaceResult() {
    if (!replaceResult?.result) return;
    try {
      await navigator.clipboard.writeText(replaceResult.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser; the copy button simply
      // won't flip to "Copied!" in that case.
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="pattern">Pattern</Label>
        <Input
          id="pattern"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="Enter a regular expression..."
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm">Flags:</span>
        {FLAG_OPTIONS.map((flag) => (
          <Button
            key={flag}
            onClick={() => toggleFlag(flag)}
            variant={flags[flag] ? "default" : "ghost"}
          >
            {flag}
          </Button>
        ))}
      </div>

      <div>
        <Label htmlFor="test-string">Test String</Label>
        <Textarea
          id="test-string"
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter text to test against..."
          rows={6}
        />
      </div>

      {result?.error && (
        <p className="text-retro-magenta text-sm" role="alert">
          {result.error}
        </p>
      )}

      {result && !result.error && (
        <div className="space-y-2">
          <p className="text-sm text-retro-muted">
            {result.matches.length} match{result.matches.length === 1 ? "" : "es"}
            {result.truncated && " (truncated)"}
          </p>

          {highlighted && (
            <div className="p-3 bg-retro-bg border border-retro-border font-mono text-sm whitespace-pre-wrap break-words">
              {highlighted.map((seg, i) =>
                seg.matched ? (
                  <span key={i} className="bg-retro-green/20">
                    {seg.text}
                  </span>
                ) : (
                  <span key={i}>{seg.text}</span>
                ),
              )}
            </div>
          )}

          {result.matches.length > 0 && (
            <ol className="space-y-1 text-sm">
              {result.matches.map((m, i) => (
                <li key={i} className="font-mono">
                  #{i + 1} at {m.index}: &quot;{m.value}&quot;
                  {m.groups.length > 0 &&
                    ` groups: [${m.groups.map((g) => `"${g}"`).join(", ")}]`}
                  {Object.keys(m.named).length > 0 &&
                    ` named: {${Object.entries(m.named)
                      .map(([k, v]) => `${k}: "${v}"`)
                      .join(", ")}}`}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor="replacement">Replace With</Label>
          {replaceResult?.result && !replaceResult.error && (
            <Button onClick={copyReplaceResult} variant="ghost" className="text-xs">
              {copied ? "Copied!" : "Copy"}
            </Button>
          )}
        </div>
        <Input
          id="replacement"
          value={replacement}
          onChange={(e) => setReplacement(e.target.value)}
          placeholder="Replacement string, e.g. $1"
        />
        {replaceResult && !replaceResult.error && (
          <Textarea
            aria-label="Replace Result"
            value={replaceResult.result}
            readOnly
            rows={6}
            className="mt-2"
          />
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  parseCronExpression,
  describeCron,
  getNextRunTimes,
} from "./cron-parser.logic";

export default function CronParser() {
  const [expression, setExpression] = useState("");
  const [count, setCount] = useState(5);
  const [description, setDescription] = useState("");
  const [nextRuns, setNextRuns] = useState<Date[]>([]);
  const [error, setError] = useState("");

  const handleParse = () => {
    setError("");
    setDescription("");
    setNextRuns([]);

    if (!expression.trim()) {
      setError("Please enter a cron expression");
      return;
    }

    try {
      const parts = parseCronExpression(expression);
      const desc = describeCron(parts);
      const runs = getNextRunTimes(parts, count);

      setDescription(desc);
      setNextRuns(runs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid cron expression");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleParse();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="cron-expression">Cron Expression</Label>
          <Input
            id="cron-expression"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="*/15 * * * *"
            className="font-mono"
          />
        </div>

        <div>
          <Label htmlFor="next-runs">Next N runs</Label>
          <Input
            id="next-runs"
            type="number"
            value={count}
            onChange={(e) =>
              setCount(Math.min(25, Math.max(1, parseInt(e.target.value) || 5)))
            }
            min={1}
            max={25}
            className="w-32"
          />
        </div>

        <Button onClick={handleParse}>Parse</Button>
      </div>

      {error && (
        <div
          className="p-4 border border-retro-border bg-retro-surface"
          role="alert"
        >
          <p className="text-retro-magenta text-sm">{error}</p>
        </div>
      )}

      {description && (
        <div className="space-y-4">
          <div className="p-4 border border-retro-border bg-retro-surface">
            <h3 className="text-retro-amber text-xs font-mono mb-2">
              DESCRIPTION
            </h3>
            <p className="text-retro-green font-mono text-sm">{description}</p>
          </div>

          <div className="p-4 border border-retro-border bg-retro-surface">
            <h3 className="text-retro-amber text-xs font-mono mb-2">
              NEXT {nextRuns.length} RUN{nextRuns.length !== 1 ? "S" : ""}
            </h3>
            <div className="space-y-2">
              {nextRuns.map((run, index) => (
                <div
                  key={index}
                  className="text-retro-green font-mono text-sm flex items-center gap-2"
                >
                  <span className="text-retro-muted">{index + 1}.</span>
                  <span>{run.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

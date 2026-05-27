import { useParams } from "react-router-dom";
import { Suspense, lazy, useMemo } from "react";
import { getToolById } from "@/tools/registry";

export function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const tool = toolId ? getToolById(toolId) : undefined;

  const LazyComponent = useMemo(() => {
    if (!tool) return null;
    return lazy(tool.component);
  }, [tool]);

  if (!tool || !LazyComponent) {
    return (
      <div className="text-retro-magenta">
        <p>{">"} ERROR: Tool not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <span className="text-retro-amber text-xs">[{tool.category}]</span>
        <h1 className="font-[family-name:var(--font-display)] text-retro-green text-sm mt-1">
          {">"} {tool.name.toUpperCase()}
        </h1>
        <p className="text-retro-muted text-xs mt-1">{tool.description}</p>
      </div>

      <div className="border border-retro-border bg-retro-surface p-4">
        <Suspense
          fallback={
            <p className="text-retro-cyan animate-pulse">Loading...</p>
          }
        >
          <LazyComponent />
        </Suspense>
      </div>
    </div>
  );
}

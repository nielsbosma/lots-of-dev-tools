import { useParams } from "react-router-dom";
import { Suspense, lazy } from "react";
import { getToolById, toolRegistry } from "@/tools/registry";

// Eagerly create all lazy components at module load time
const lazyComponents = new Map(
  toolRegistry.map((tool) => [tool.id, lazy(tool.component)])
);

// Wrapper component to render cached lazy component
// Component is retrieved from a module-level cache, so it's not recreated on each render
/* eslint-disable react-hooks/static-components */
function LazyToolComponent({ toolId }: { toolId: string }) {
  const Component = lazyComponents.get(toolId);
  if (!Component) return null;
  return <Component />;
}
/* eslint-enable react-hooks/static-components */

export function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const tool = toolId ? getToolById(toolId) : undefined;

  if (!tool) {
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
          <LazyToolComponent toolId={tool.id} />
        </Suspense>
      </div>
    </div>
  );
}

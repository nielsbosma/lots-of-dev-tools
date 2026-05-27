import { Link } from "react-router-dom";
import { toolRegistry } from "@/tools/registry";

export function HomePage() {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-retro-green text-sm mb-2">
        {">"} WELCOME TO DEV_TOOLS
      </h1>
      <p className="text-retro-muted text-sm mb-8">
        A collection of developer utilities. Select a tool from the sidebar or
        browse below.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {toolRegistry.map((tool) => (
          <Link
            key={tool.id}
            to={`/tool/${tool.id}`}
            className="block p-4 border border-retro-border bg-retro-surface hover:border-retro-green hover:shadow-[0_0_10px_rgba(57,255,20,0.2)] transition-all"
          >
            <span className="text-retro-amber text-xs">[{tool.category}]</span>
            <h2 className="text-retro-green text-sm mt-1">{tool.name}</h2>
            <p className="text-retro-muted text-xs mt-1">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toolRegistry, getCategories } from "@/tools/registry";

export function Sidebar() {
  const location = useLocation();
  const categories = getCategories();
  const [search, setSearch] = useState("");

  const filtered = toolRegistry.filter(
    (tool) =>
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside className="w-64 border-r border-retro-border bg-retro-surface p-4 overflow-y-auto flex-shrink-0">
      <Link to="/" className="block mb-4">
        <h1 className="font-[family-name:var(--font-display)] text-retro-green text-xs leading-relaxed">
          {">"} DEV_TOOLS
        </h1>
      </Link>

      <input
        type="text"
        placeholder="search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-2 py-1 mb-4 text-xs font-mono bg-retro-bg border border-retro-border text-retro-text placeholder:text-retro-muted focus:outline-none focus:ring-1 focus:ring-retro-cyan"
        aria-label="Search tools"
      />

      <nav>
        {categories.map((category) => {
          const tools = filtered.filter((t) => t.category === category);
          if (tools.length === 0) return null;
          return (
            <div key={category} className="mb-4">
              <h2 className="text-retro-amber text-xs uppercase tracking-wider mb-2">
                [{category}]
              </h2>
              <ul className="space-y-1">
                {tools.map((tool) => (
                  <li key={tool.id}>
                    <Link
                      to={`/tool/${tool.id}`}
                      className={cn(
                        "block px-2 py-1 text-xs font-mono transition-colors",
                        location.pathname === `/tool/${tool.id}`
                          ? "text-retro-green bg-retro-bg border-l-2 border-retro-green"
                          : "text-retro-muted hover:text-retro-green hover:bg-retro-bg",
                      )}
                    >
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
        <footer className="mt-12 pt-4 border-t border-retro-border text-center text-retro-muted text-xs">
          <a
            href="https://github.com/nielsbosma/lots-of-dev-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-retro-green transition-colors"
          >
            [GITHUB]
          </a>
          <span> · Created by Niels Bosma</span>
        </footer>
      </main>
    </div>
  );
}

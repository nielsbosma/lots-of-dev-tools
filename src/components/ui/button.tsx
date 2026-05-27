import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost";
}

export function Button({
  className,
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 font-mono text-sm transition-all cursor-pointer",
        "border border-retro-border",
        "focus:outline-none focus:ring-2 focus:ring-retro-cyan",
        variant === "default" &&
          "bg-retro-surface text-retro-green hover:bg-retro-border hover:shadow-[0_0_10px_rgba(57,255,20,0.3)]",
        variant === "ghost" &&
          "bg-transparent text-retro-muted hover:text-retro-green hover:bg-retro-surface",
        className,
      )}
      {...props}
    />
  );
}

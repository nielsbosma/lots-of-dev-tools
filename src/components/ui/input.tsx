import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full px-3 py-2 font-mono text-sm",
        "bg-retro-bg border border-retro-border text-retro-text",
        "placeholder:text-retro-muted",
        "focus:outline-none focus:ring-2 focus:ring-retro-cyan focus:border-retro-cyan",
        className,
      )}
      {...props}
    />
  );
}

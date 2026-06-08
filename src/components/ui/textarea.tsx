import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full px-3 py-2 font-mono text-sm",
        "bg-retro-bg border border-retro-border text-retro-text",
        "placeholder:text-retro-muted",
        "focus:outline-none focus:ring-2 focus:ring-retro-cyan focus:border-retro-cyan",
        "resize-y min-h-[100px]",
        className,
      )}
      {...props}
    />
  );
}

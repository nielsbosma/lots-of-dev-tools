import { cn } from "@/lib/utils";
import type { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn("block text-xs font-mono text-retro-amber mb-1", className)}
      {...props}
    />
  );
}

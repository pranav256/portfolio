"use client";

import * as React from "react";
import { CopyIcon } from "@/components/icons";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  onCopied?: () => void;
  timeout?: number;
}

function CopyButton({ value, onCopied, timeout = 2000, className, onClick, ...props }: CopyButtonProps) {
  const [status, setStatus] = React.useState<"idle" | "copying" | "copied" | "error">("idle");
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function handleCopy() {
    if (timer.current) clearTimeout(timer.current);
    setStatus("copying");
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
      onCopied?.();
      timer.current = setTimeout(() => setStatus("idle"), timeout);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="code-copy">
      <Button
        type="button"
        variant="ghost"
        className={cn("code-copy-button", className)}
        disabled={status === "copying"}
        onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) void handleCopy(); }}
        {...props}
      >
        <CopyIcon className="icon" aria-hidden="true" />
        {status === "copied" ? "Copied" : status === "copying" ? "Copying…" : "Copy code"}
      </Button>
      <span role="status" className={status === "error" ? "copy-error" : "sr-only"}>
        {status === "error" ? "Couldn’t copy. Select the code and copy it manually." : status === "copied" ? "Code copied to clipboard." : ""}
      </span>
    </div>
  );
}

export { CopyButton };

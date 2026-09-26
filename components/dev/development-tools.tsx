"use client";

import dynamic from "next/dynamic";

// This branch is eliminated from production. Enable explicitly while tuning.
const DevelopmentTools = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "1"
  ? dynamic(() => import("./tool-panel"), { ssr: false })
  : () => null;

export { DevelopmentTools };

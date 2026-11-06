"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HalfMoonIcon, SunLightIcon } from "@/components/icons";
import { applyTheme, themeStorageKey } from "@/lib/theme";

export function ThemeToggle() {
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== themeStorageKey && event.key !== null) return;
      if (event.storageArea !== localStorage) return;
      applyTheme(event.newValue === "light" ? "light" : "dark", false);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="theme-toggle"
      title="Change color theme"
      onClick={() => applyTheme(document.documentElement.classList.contains("dark") ? "light" : "dark")}
    >
      <span className="theme-to-light">
        <SunLightIcon className="icon" aria-hidden="true" />
        <span className="sr-only">Switch to light mode</span>
      </span>
      <span className="theme-to-dark">
        <HalfMoonIcon className="icon" aria-hidden="true" />
        <span className="sr-only">Switch to dark mode</span>
      </span>
    </Button>
  );
}

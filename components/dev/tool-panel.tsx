"use client";

import { useEffect } from "react";
import { DialRoot, useDialKit } from "dialkit";
import { Agentation } from "agentation";
import { interactionDefaults } from "@/lib/interaction-settings";
import "dialkit/styles.css";

export default function ToolPanel() {
  const values = useDialKit("Artwork motion", {
    revealDistance: [interactionDefaults.revealDistance, 0, 24, 1],
    pointerTravel: [interactionDefaults.pointerTravel, 0, 16, 1],
    durationScale: [interactionDefaults.durationScale, 0.5, 2, 0.1],
    replay: { type: "action" },
  }, {
    id: "pranav-artwork-motion",
    persist: true,
    onAction: () => window.dispatchEvent(new Event("portfolio:replay-art")),
  });

  useEffect(() => { void import("react-grab"); }, []);
  useEffect(() => {
    const style = document.documentElement.style;
    style.setProperty("--art-reveal-distance", String(values.revealDistance));
    style.setProperty("--art-pointer-travel", String(values.pointerTravel));
    style.setProperty("--art-duration-scale", String(values.durationScale));
    return () => {
      for (const name of ["--art-reveal-distance", "--art-pointer-travel", "--art-duration-scale"]) style.removeProperty(name);
    };
  }, [values.revealDistance, values.pointerTravel, values.durationScale]);

  return <><DialRoot position="top-right" /><Agentation appName="Pranav’s portfolio" enableKeyboardShortcuts={false} /></>;
}

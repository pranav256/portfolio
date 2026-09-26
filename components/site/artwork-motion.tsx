"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { interactionDefaults } from "@/lib/interaction-settings";

export function ArtworkMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let dispose = () => {};

    function setup() {
      dispose();
      if (reduced.matches) return;
      const animations = new Set<Animation>();
      const artwork = document.querySelectorAll<HTMLElement>(".hero-art, .project-cover");
      const hero = document.querySelector<HTMLElement>(".hero-art");
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          const style = getComputedStyle(document.documentElement);
          const revealValue = style.getPropertyValue("--art-reveal-distance");
          const distance = revealValue ? parseFloat(revealValue) : interactionDefaults.revealDistance;
          const scale = parseFloat(style.getPropertyValue("--art-duration-scale")) || interactionDefaults.durationScale;
          const duration = parseFloat(style.getPropertyValue("--transition-duration-slow")) * scale;
          // Content is always visible. Only the decorative artwork moves.
          const animation = entry.target.animate(
            [{ translate: `0 ${distance}px` }, { translate: "0 0" }],
            { duration, easing: style.getPropertyValue("--ease-out").trim() },
          );
          animations.add(animation);
          void animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
        }
      }, { threshold: 0.12 });
      artwork.forEach((element) => observer.observe(element));

      function followPointer(event: PointerEvent) {
        if (!hero || event.pointerType === "touch") return;
        const rect = hero.getBoundingClientRect();
        const value = getComputedStyle(document.documentElement).getPropertyValue("--art-pointer-travel");
        const travel = value ? parseFloat(value) : interactionDefaults.pointerTravel;
        const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
        const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
        hero.style.setProperty("--art-x", `${x * travel}px`);
        hero.style.setProperty("--art-y", `${y * travel}px`);
      }
      function resetPointer() {
        hero?.style.removeProperty("--art-x");
        hero?.style.removeProperty("--art-y");
      }
      if (finePointer.matches) {
        hero?.addEventListener("pointermove", followPointer);
        hero?.addEventListener("pointerleave", resetPointer);
      }
      dispose = () => {
        observer.disconnect();
        animations.forEach((animation) => animation.cancel());
        hero?.removeEventListener("pointermove", followPointer);
        hero?.removeEventListener("pointerleave", resetPointer);
        resetPointer();
      };
    }

    setup();
    reduced.addEventListener("change", setup);
    finePointer.addEventListener("change", setup);
    window.addEventListener("portfolio:replay-art", setup);
    return () => {
      dispose();
      reduced.removeEventListener("change", setup);
      finePointer.removeEventListener("change", setup);
      window.removeEventListener("portfolio:replay-art", setup);
    };
  }, [pathname]);

  return null;
}

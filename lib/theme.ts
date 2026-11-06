export type Theme = "dark" | "light";

export const themeStorageKey = "pranav-theme";

// Runs in the head before paint. Only a saved light choice overrides the dark default.
export const themeInitScript = `(function(){try{document.documentElement.classList.toggle("dark",localStorage.getItem("${themeStorageKey}")!=="light")}catch(e){}})()`;

let firstFrame = 0;
let secondFrame = 0;

export function applyTheme(theme: Theme, persist = true) {
  const root = document.documentElement;
  cancelAnimationFrame(firstFrame);
  cancelAnimationFrame(secondFrame);
  root.classList.add("theme-switching");
  root.classList.toggle("dark", theme === "dark");

  if (persist) {
    try {
      localStorage.setItem(themeStorageKey, theme);
    } catch {
      // The switch still works for this page when browser storage is unavailable.
    }
  }

  firstFrame = requestAnimationFrame(() => {
    secondFrame = requestAnimationFrame(() => root.classList.remove("theme-switching"));
  });
}

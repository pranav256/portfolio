import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import dsGuardrail from "./.better-design/eslint-design-system.mjs"; // better-design-guardrail

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  ...dsGuardrail,
  globalIgnores([".next/**", "out/**", "components/ui/**", "research/**", "next-env.d.ts"]),
]);

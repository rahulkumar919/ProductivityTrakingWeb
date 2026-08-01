import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Loading from localStorage on mount inside useEffect is a valid pattern —
      // this rule is too aggressive for client-side hydration code.
      "react-hooks/set-state-in-effect": "off",
      // Unused vars as warnings only, not errors.
      "@typescript-eslint/no-unused-vars": "warn",
      // <img> tags are intentional for base64 data URLs (Next Image can't handle them).
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;

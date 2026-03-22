import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Ignore generated and non-source directories
  { ignores: ["dist/**", "coverage/**"] },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Project-specific overrides
  {
    files: ["src/**/*.ts"],
    rules: {
      // Disallow raw console calls — use the pino logger instead
      "no-console": "error",

      // Disable base rule in favour of the TypeScript-aware version
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Warn on explicit any — prefer proper types
      "@typescript-eslint/no-explicit-any": "warn",
    },
  }
);

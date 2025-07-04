import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import configPrettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["node_modules", "tailwind.config.js"],
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  eslintPluginPrettier,
  reactHooks.configs["recommended-latest"],
  configPrettier,
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "react/prop-types": "off",
    },
  },
];

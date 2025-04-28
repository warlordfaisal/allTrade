import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: { react: { version: "18.3" } },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/jsx-no-target-blank": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  // Configuration for Node.js (backend) files
  {
    files: ["routes/**/*.js", "*.js"], // Adjust the pattern to match your backend files
    excludedFiles: ["**/*.{jsx}"], // Exclude React files
    languageOptions: {
      globals: {
        ...globals.node, // Add Node.js globals
      },
      sourceType: "module", // If your backend uses ES modules
      ecmaVersion: "latest", // Or your preferred ECMAScript version
    },
    rules: {
      ...js.configs.recommended.rules, // You might want a more specific base config for Node.js
      "no-console": "warn", // Example Node.js specific rule
      "no-unused-vars": "warn", // Another common one
    },
  },
];

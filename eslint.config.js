// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

const { FlatCompat } = require('@eslint/eslintrc');
const compat = new FlatCompat();

module.exports = tseslint.config(
  // Configuración para archivos TypeScript
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },
  // Configuración para archivos HTML (plantillas)
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      // Puedes agregar tus reglas específicas para plantillas aquí
      // Desactiva prettier si te da conflictos
      "prettier/prettier": "off",
    },
  },
  // Prettier Integration SOLO para archivos TS
  ...compat.extends('plugin:prettier/recommended').map(config => ({
    ...config,
    files: ["**/*.ts"], // Solo aplicar Prettier a TypeScript
  }))
);

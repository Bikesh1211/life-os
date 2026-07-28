import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "drizzle/**",
      "public/**",
      "next-env.d.ts",
    ],
  },

  ...coreWebVitals,
  ...nextTypescript,

  {
    rules: {
      // Surfaced as warnings so the existing ~400 occurrences don't block CI on
      // day one. Tighten to "error" once the backlog is worked down.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Direct db access belongs in a module repository, never in a route
      // handler or component — it is how userId scoping gets skipped.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/core/database",
              importNames: ["db"],
              message:
                "Import db only inside a module repository. Route handlers and components must go through a module service so ownership scoping is applied.",
            },
          ],
        },
      ],
    },
  },

  // Repositories are the sanctioned place for raw db access. Both the flat
  // (repository.ts) and split (repository/*.ts) layouts are in use.
  {
    files: [
      "src/modules/**/repository.ts",
      "src/modules/**/repository/**",
      "src/core/**/repository.ts",
      "src/core/database/**",
      "src/modules/**/seed.ts",
      "scripts/**",
    ],
    rules: { "no-restricted-imports": "off" },
  },
];

export default config;

import { createTheme, type MantineThemeOverride } from "@mantine/core";

export const theme: MantineThemeOverride = createTheme({
  primaryColor: "blue",
  fontFamily:
    'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontFamilyMonospace:
    '"SF Mono", "Fira Code", "JetBrains Mono", "Fira Mono", Menlo, Monaco, monospace',
  defaultRadius: "md",
  colors: {
    blue: [
      "#eff6ff",
      "#eff6ff",
      "#dbeafe",
      "#bfdbfe",
      "#93c5fd",
      "#60a5fa",
      "#3b82f6",
      "#2563eb",
      "#1d4ed8",
      "#1e40af",
    ],
    gray: [
      "#f9fafb",
      "#f3f4f6",
      "#e5e7eb",
      "#d1d5db",
      "#9ca3af",
      "#6b7280",
      "#4b5563",
      "#374151",
      "#1f2937",
      "#111827",
    ],
    dark: [
      "#C1C2C5",
      "#A6A7AB",
      "#909296",
      "#5C5F66",
      "#373A40",
      "#2C2E33",
      "#1c1c2b",
      "#14141f",
      "#0a0a15",
      "#06060d",
    ],
  },
  shadows: {
    xs: "0 1px 2px rgba(0, 0, 0, 0.04)",
    sm: "0 1px 3px rgba(0, 0, 0, 0.06)",
    md: "0 4px 8px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 20px rgba(0, 0, 0, 0.06)",
    xl: "0 20px 30px rgba(0, 0, 0, 0.08)",
  },
  components: {
    Paper: {
      defaultProps: {
        withBorder: true,
      },
    },
    Card: {
      defaultProps: {
        withBorder: true,
      },
    },
    ActionIcon: {
      defaultProps: {
        variant: "subtle",
      },
    },
  },
  other: {
    transitionDuration: {
      fast: "150ms",
      normal: "250ms",
      slow: "400ms",
    },
    borderRadius: {
      sm: "4px",
      md: "8px",
      lg: "12px",
      xl: "16px",
    },
  },
});

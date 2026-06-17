import { createTheme, type MantineThemeOverride } from "@mantine/core";

export const theme: MantineThemeOverride = createTheme({
  primaryColor: "blue",
  fontFamily:
    'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontFamilyMonospace:
    '"SF Mono", "Fira Code", "JetBrains Mono", "Fira Mono", Menlo, Monaco, monospace',
  defaultRadius: "md",
  colors: {
    gray: [
      "#f8f9fa",
      "#f0f2f5",
      "#e4e7ec",
      "#d0d4dc",
      "#a8aeb8",
      "#7e8490",
      "#5c6270",
      "#3a3f4a",
      "#282c35",
      "#181b21",
    ],
    dark: [
      "#C1C2C5",
      "#A6A7AB",
      "#909296",
      "#5C5F66",
      "#373A40",
      "#2C2E33",
      "#25262B",
      "#1A1B1E",
      "#141517",
      "#101113",
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

import { createTheme, type MantineThemeOverride, virtualColor } from "@mantine/core";

export const theme: MantineThemeOverride = createTheme({
  primaryColor: "brand",
  fontFamily:
    'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontFamilyMonospace:
    '"SF Mono", "Fira Code", "JetBrains Mono", "Fira Mono", Menlo, Monaco, monospace',
  defaultRadius: "lg",
  white: "#ffffff",
  black: "#06060d",
  colors: {
    brand: [
      "#eff6ff",
      "#dbeafe",
      "#bfdbfe",
      "#93c5fd",
      "#60a5fa",
      "#3b82f6",
      "#2563eb",
      "#1d4ed8",
      "#1e40af",
      "#1e3a8a",
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
      "#141420",
      "#0f0f1a",
      "#0a0a15",
      "#06060d",
    ],
    green: [
      "#ecfdf5",
      "#d1fae5",
      "#a7f3d0",
      "#6ee7b7",
      "#34d399",
      "#10b981",
      "#059669",
      "#047857",
      "#065f46",
      "#064e3b",
    ],
    yellow: [
      "#fffbeb",
      "#fef3c7",
      "#fde68a",
      "#fcd34d",
      "#fbbf24",
      "#f59e0b",
      "#d97706",
      "#b45309",
      "#92400e",
      "#78350f",
    ],
    red: [
      "#fff1f2",
      "#ffe4e6",
      "#fecdd3",
      "#fda4af",
      "#fb7185",
      "#f43f5e",
      "#e11d48",
      "#be123c",
      "#9f1239",
      "#881337",
    ],
    cyan: [
      "#ecfeff",
      "#cffafe",
      "#a5f3fc",
      "#67e8f9",
      "#22d3ee",
      "#06b6d4",
      "#0891b2",
      "#0e7490",
      "#155e75",
      "#164e63",
    ],
    violet: [
      "#f5f3ff",
      "#ede9fe",
      "#ddd6fe",
      "#c4b5fd",
      "#a78bfa",
      "#8b5cf6",
      "#7c3aed",
      "#6d28d9",
      "#5b21b6",
      "#4c1d95",
    ],
  },
  shadows: {
    xs: "0 1px 2px 0 rgb(0 0 0 / 0.03)",
    sm: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)",
  },
  components: {
    Paper: {
      defaultProps: {
        withBorder: true,
      },
      styles: {
        root: {
          transition: "box-shadow 0.2s ease, transform 0.2s ease",
        },
      },
    },
    Card: {
      defaultProps: {
        withBorder: true,
        radius: "lg",
        padding: "lg",
      },
      styles: {
        root: {
          transition: "box-shadow 0.2s ease, transform 0.2s ease",
        },
      },
    },
    ActionIcon: {
      defaultProps: {
        variant: "subtle",
      },
    },
    Button: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        root: {
          fontWeight: 600,
          transition: "all 0.15s ease",
          "&:active": {
            transform: "scale(0.98)",
          },
        },
      },
    },
    Tabs: {
      defaultProps: {
        radius: "lg",
      },
      styles: {
        tab: {
          fontWeight: 500,
          transition: "all 0.15s ease",
          "&[data-active]": {
            fontWeight: 600,
          },
        },
      },
    },
    Modal: {
      defaultProps: {
        radius: "xl",
        padding: "lg",
        overlayProps: {
          blur: 8,
        },
      },
      styles: {
        content: {
          boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.20)",
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        input: {
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        },
      },
    },
    Select: {
      defaultProps: {
        radius: "md",
      },
    },
    Textarea: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        input: {
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        },
      },
    },
    Table: {
      defaultProps: {
        highlightOnHover: true,
        withTableBorder: true,
        withColumnBorders: false,
      },
      styles: {
        table: {
          borderCollapse: "separate",
          borderSpacing: 0,
        },
        th: {
          fontWeight: 600,
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--mantine-color-dimmed)",
          borderBottom: "1px solid var(--mantine-color-default-border)",
          padding: "12px 16px",
        },
        td: {
          padding: "12px 16px",
          borderBottom: "1px solid var(--mantine-color-default-border)",
        },
      },
    },
    Badge: {
      defaultProps: {
        radius: "sm",
      },
      styles: {
        root: {
          fontWeight: 500,
          textTransform: "none",
          letterSpacing: "normal",
        },
      },
    },
    Tooltip: {
      defaultProps: {
        withArrow: true,
        arrowSize: 6,
        radius: "md",
        offset: 6,
      },
    },
    Menu: {
      defaultProps: {
        radius: "lg",
        shadow: "xl",
        withArrow: true,
        arrowSize: 8,
        offset: 6,
      },
      styles: {
        dropdown: {
          padding: "4px",
          border: "1px solid var(--mantine-color-default-border)",
        },
        item: {
          borderRadius: "8px",
          padding: "8px 12px",
          fontWeight: 500,
          transition: "background 0.1s ease",
        },
        label: {
          padding: "8px 12px 4px",
          fontWeight: 600,
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        },
        divider: {
          margin: "4px 8px",
        },
      },
    },
    Notification: {
      defaultProps: {
        radius: "lg",
      },
      styles: {
        root: {
          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.10), 0 8px 10px -6px rgb(0 0 0 / 0.06)",
          border: "1px solid var(--mantine-color-default-border)",
        },
      },
    },
    Skeleton: {
      styles: {
        root: {
          "&::before": {
            background: "var(--mantine-color-dark-5)",
          },
          "&::after": {
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
          },
        },
      },
    },
    AppShell: {
      styles: {
        main: {
          transition: "padding-left 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        },
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
      sm: "6px",
      md: "10px",
      lg: "14px",
      xl: "18px",
      "2xl": "24px",
    },
  },
});

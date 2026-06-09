import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#3b82f6",
          colorBackground: "#141517",
          colorInputBackground: "#1A1B1E",
          colorText: "#C1C2C5",
          colorTextSecondary: "#909296",
          colorInputText: "#C1C2C5",
          colorNeutral: "#2C2E33",
          borderRadius: "0.5rem",
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: "0.875rem",
        },
        elements: {
          card: {
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)",
            border: "1px solid #25262B",
          },
          headerTitle: {
            fontSize: "1.25rem",
            fontWeight: "600",
          },
          formButtonPrimary: {
            fontSize: "0.875rem",
            fontWeight: "500",
            padding: "0.625rem 1rem",
            background: "#3b82f6",
            transition: "background 150ms ease",
          },
          formButtonPrimaryHover: {
            background: "#2563eb",
          },
          footerActionLink: {
            color: "#3b82f6",
            fontWeight: "500",
          },
          socialButtonsBlockButton: {
            fontSize: "0.875rem",
            fontWeight: "500",
            border: "1px solid #2C2E33",
            background: "#1A1B1E",
            color: "#FFFFFF",
            transition: "background 150ms ease",
          },
          socialButtonsBlockButtonHover: {
            background: "#25262B",
          },
          dividerLine: {
            background: "#2C2E33",
          },
          dividerText: {
            color: "#5C5F66",
          },
        },
      }}
    />
  );
}

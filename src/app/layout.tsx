import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/infrastructure/providers";
import { APP_NAME, APP_DESCRIPTION } from "@/core/constants";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/spotlight/styles.css";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest",
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <meta name="theme-color" content="#1A1B1E" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
      </head>
      <body suppressHydrationWarning>
        <script
          id="mantine-color-scheme"
          dangerouslySetInnerHTML={{
            __html: `try{var c=window.localStorage.getItem("mantine-color-scheme-value");var s=c==="light"||c==="dark"||c==="auto"?c:"auto";var d=s!=="auto"?s:window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";document.documentElement.setAttribute("data-mantine-color-scheme",d)}catch(e){}`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

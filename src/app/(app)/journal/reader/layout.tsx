import type { Metadata } from "next";
import { ReaderChrome } from "./_components/reader-chrome";

export const metadata: Metadata = {
  title: {
    default: "My Journal",
    template: "%s — My Journal",
  },
  description: "A collection of ordinary days, extraordinary memories.",
};

export default function ReaderLayout({ children }: { children: React.ReactNode }) {
  return <ReaderChrome>{children}</ReaderChrome>;
}

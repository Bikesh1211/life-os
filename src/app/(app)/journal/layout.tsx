import { JournalTabs } from "./JournalTabs";

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JournalTabs />
      {children}
    </>
  );
}

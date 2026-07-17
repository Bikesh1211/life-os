"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { useSearchParams } from "next/navigation";
import { Stack, Title, Text, ScrollArea } from "@mantine/core";
import { ManualSidebar } from "./ManualSidebar";
import EditorsRouter from "./EditorsRouter";
import type { StrategySection } from "@/modules/strategy";

type Props = {
  sections: StrategySection[];
};

export const StrategyContent = memo(function StrategyContent({ sections }: Props) {
  const searchParams = useSearchParams();
  const initialSection = searchParams.get("section") ?? "dashboard";
  const [activeSection, setActiveSection] = useState(initialSection);

  const sectionMap = useMemo(() => {
    const map = new Map<string, StrategySection[]>();
    for (const s of sections) {
      const list = map.get(s.sectionType) ?? [];
      list.push(s);
      map.set(s.sectionType, list);
    }
    return map;
  }, [sections]);

  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section);
    const url = section === "dashboard" ? "/strategy" : `/strategy?section=${section}`;
    window.history.replaceState(null, "", url);
  }, []);

  return (
    <div style={{ display: "flex", gap: 24, height: "calc(100vh - 100px)" }}>
      <ManualSidebar activeSection={activeSection} onSectionChange={handleSectionChange} />

      <ScrollArea style={{ flex: 1, height: "100%" }} offsetScrollbars>
        <Stack gap="xl" style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 60 }}>
          <Title order={2}>Operating Manual</Title>
          <Text c="dimmed" size="sm">
            Your personal handbook — how you think, work, make decisions, and live.
          </Text>
          <EditorsRouter activeSection={activeSection} sectionMap={sectionMap} />
        </Stack>
      </ScrollArea>
    </div>
  );
});

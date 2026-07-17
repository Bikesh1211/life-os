"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stack, Title, Text, ScrollArea } from "@mantine/core";
import { ManualSidebar } from "./ManualSidebar";
import { EditorsRouter } from "./EditorsRouter";
import type { StrategySection, SectionType } from "@/modules/strategy";

type Props = {
  sections: StrategySection[];
};

export function StrategyContent({ sections }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSection = searchParams.get("section") ?? "dashboard";

  const handleSectionChange = useCallback(
    (section: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (section === "dashboard") {
        params.delete("section");
      } else {
        params.set("section", section);
      }
      const qs = params.toString();
      router.replace(`/strategy${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div style={{ display: "flex", gap: 24, height: "calc(100vh - 100px)" }}>
      <ManualSidebar activeSection={activeSection} onSectionChange={handleSectionChange} />

      <ScrollArea style={{ flex: 1, height: "100%" }} offsetScrollbars>
        <Stack gap="xl" style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 60 }}>
          <Title order={2}>Operating Manual</Title>
          <Text c="dimmed" size="sm">
            Your personal handbook — how you think, work, make decisions, and live.
          </Text>
          <EditorsRouter activeSection={activeSection} sections={sections} onSectionChange={handleSectionChange} />
        </Stack>
      </ScrollArea>
    </div>
  );
}

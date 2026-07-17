"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs } from "@mantine/core";
import { IconDashboard, IconBooks, IconCards, IconListCheck, IconPencil } from "@tabler/icons-react";
import EnglishDashboard from "./EnglishDashboard";
import VocabularyPanel from "./VocabularyPanel";
import FlashcardsTab from "./FlashcardsTab";
import MultipleChoiceTab from "./MultipleChoiceTab";
import FillBlankTab from "./FillBlankTab";

const tabs = [
  { value: "dashboard", label: "Dashboard", icon: IconDashboard },
  { value: "vocabulary", label: "Vocabulary", icon: IconBooks },
  { value: "flashcards", label: "Flashcards", icon: IconCards },
  { value: "quiz", label: "Quiz", icon: IconListCheck },
  { value: "fill-blank", label: "Fill Blank", icon: IconPencil },
];

export function EnglishContent() {
  const searchParams = useSearchParams();
  const subTab = searchParams.get("sub") ?? "dashboard";
  const [activeTab, setActiveTab] = useState(subTab);

  const handleTabChange = useCallback((value: string | null) => {
    setActiveTab(value ?? "dashboard");
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "dashboard") {
      params.set("sub", value);
    } else {
      params.delete("sub");
    }
    window.history.replaceState(null, "", `/learning?tab=english${params.toString() ? `&${params}` : ""}`);
  }, [searchParams]);

  return (
    <Tabs value={activeTab} onChange={handleTabChange}>
      <Tabs.List mb="md">
        {tabs.map((tab) => (
          <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon size={16} />}>
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <Tabs.Panel value="dashboard"><EnglishDashboard /></Tabs.Panel>
      <Tabs.Panel value="vocabulary"><VocabularyPanel /></Tabs.Panel>
      <Tabs.Panel value="flashcards"><FlashcardsTab /></Tabs.Panel>
      <Tabs.Panel value="quiz"><MultipleChoiceTab /></Tabs.Panel>
      <Tabs.Panel value="fill-blank"><FillBlankTab /></Tabs.Panel>
    </Tabs>
  );
}

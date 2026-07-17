"use client";

import { DashboardPanel } from "./editors/DashboardPanel";
import { AboutMeEditor } from "./editors/AboutMeEditor";
import { CoreValuesEditor } from "./editors/CoreValuesEditor";
import { LifePrinciplesEditor } from "./editors/LifePrinciplesEditor";
import { StrengthsEditor } from "./editors/StrengthsEditor";
import { WeaknessesEditor } from "./editors/WeaknessesEditor";
import { LongTermVisionEditor } from "./editors/LongTermVisionEditor";
import { RulesEditor } from "./editors/RulesEditor";
import { BoundariesEditor } from "./editors/BoundariesEditor";
import { EnergyPatternsEditor } from "./editors/EnergyPatternsEditor";
import { WorkStyleEditor } from "./editors/WorkStyleEditor";
import { ReflectionNotesEditor } from "./editors/ReflectionNotesEditor";
import { ReviewScheduleEditor } from "./editors/ReviewScheduleEditor";
import { VersionsPanel } from "./editors/VersionsPanel";
import type { StrategySection } from "@/modules/strategy";

type Props = {
  activeSection: string;
  sections: StrategySection[];
  onSectionChange: (section: string) => void;
};

export function EditorsRouter({ activeSection, sections, onSectionChange }: Props) {
  const sectionMap = new Map<string, StrategySection[]>();
  for (const s of sections) {
    const list = sectionMap.get(s.sectionType) ?? [];
    list.push(s);
    sectionMap.set(s.sectionType, list);
  }

  const getSections = (type: string) => sectionMap.get(type) ?? [];

  switch (activeSection) {
    case "dashboard":
      return <DashboardPanel sections={sections} />;
    case "about_me":
      return <AboutMeEditor initial={getSections("about_me")} />;
    case "core_values":
      return <CoreValuesEditor initial={getSections("core_values")} />;
    case "life_principles":
      return <LifePrinciplesEditor initial={getSections("life_principles")} />;
    case "strengths":
      return <StrengthsEditor initial={getSections("strengths")} />;
    case "weaknesses":
      return <WeaknessesEditor initial={getSections("weaknesses")} />;
    case "long_term_vision":
      return <LongTermVisionEditor initial={getSections("long_term_vision")} />;
    case "rules":
      return <RulesEditor initial={getSections("rules")} />;
    case "boundaries":
      return <BoundariesEditor initial={getSections("boundaries")} />;
    case "energy_patterns":
      return <EnergyPatternsEditor initial={getSections("energy_patterns")} />;
    case "work_style":
      return <WorkStyleEditor initial={getSections("work_style")} />;
    case "reflection_notes":
      return <ReflectionNotesEditor initial={getSections("reflection_notes")} />;
    case "review_schedule":
      return <ReviewScheduleEditor initial={getSections("review_schedule")} />;
    case "versions":
      return <VersionsPanel />;
    default:
      return <DashboardPanel sections={sections} />;
  }
}

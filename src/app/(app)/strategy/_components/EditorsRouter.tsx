"use client";

import { lazy, Suspense, memo } from "react";
import { Stack, Skeleton, Group } from "@mantine/core";
import type { StrategySection } from "@/modules/strategy";

const DashboardPanel = lazy(() => import("./editors/DashboardPanel").then((m) => ({ default: m.DashboardPanel })));
const AboutMeEditor = lazy(() => import("./editors/AboutMeEditor").then((m) => ({ default: m.AboutMeEditor })));
const CoreValuesEditor = lazy(() => import("./editors/CoreValuesEditor").then((m) => ({ default: m.CoreValuesEditor })));
const LifePrinciplesEditor = lazy(() => import("./editors/LifePrinciplesEditor").then((m) => ({ default: m.LifePrinciplesEditor })));
const StrengthsEditor = lazy(() => import("./editors/StrengthsEditor").then((m) => ({ default: m.StrengthsEditor })));
const WeaknessesEditor = lazy(() => import("./editors/WeaknessesEditor").then((m) => ({ default: m.WeaknessesEditor })));
const LongTermVisionEditor = lazy(() => import("./editors/LongTermVisionEditor").then((m) => ({ default: m.LongTermVisionEditor })));
const RulesEditor = lazy(() => import("./editors/RulesEditor").then((m) => ({ default: m.RulesEditor })));
const BoundariesEditor = lazy(() => import("./editors/BoundariesEditor").then((m) => ({ default: m.BoundariesEditor })));
const EnergyPatternsEditor = lazy(() => import("./editors/EnergyPatternsEditor").then((m) => ({ default: m.EnergyPatternsEditor })));
const WorkStyleEditor = lazy(() => import("./editors/WorkStyleEditor").then((m) => ({ default: m.WorkStyleEditor })));
const ReflectionNotesEditor = lazy(() => import("./editors/ReflectionNotesEditor").then((m) => ({ default: m.ReflectionNotesEditor })));
const ReviewScheduleEditor = lazy(() => import("./editors/ReviewScheduleEditor").then((m) => ({ default: m.ReviewScheduleEditor })));
const VersionsPanel = lazy(() => import("./editors/VersionsPanel").then((m) => ({ default: m.VersionsPanel })));

function SectionSkeleton() {
  return (
    <Stack gap="md">
      <Skeleton height={32} width={240} />
      <Skeleton height={16} width={380} />
      <Skeleton height={120} radius="md" />
      <Skeleton height={40} width={200} />
      <Skeleton height={160} radius="md" />
      <Skeleton height={160} radius="md" />
    </Stack>
  );
}

type Props = {
  activeSection: string;
  sectionMap: Map<string, StrategySection[]>;
};

const getSections = (sectionMap: Map<string, StrategySection[]>, type: string) => sectionMap.get(type) ?? [];

function renderEditor(activeSection: string, sectionMap: Map<string, StrategySection[]>) {
  switch (activeSection) {
    case "dashboard":
      return <DashboardPanel sections={getAllSections(sectionMap)} />;
    case "about_me":
      return <AboutMeEditor initial={getSections(sectionMap, "about_me")} />;
    case "core_values":
      return <CoreValuesEditor initial={getSections(sectionMap, "core_values")} />;
    case "life_principles":
      return <LifePrinciplesEditor initial={getSections(sectionMap, "life_principles")} />;
    case "strengths":
      return <StrengthsEditor initial={getSections(sectionMap, "strengths")} />;
    case "weaknesses":
      return <WeaknessesEditor initial={getSections(sectionMap, "weaknesses")} />;
    case "long_term_vision":
      return <LongTermVisionEditor initial={getSections(sectionMap, "long_term_vision")} />;
    case "rules":
      return <RulesEditor initial={getSections(sectionMap, "rules")} />;
    case "boundaries":
      return <BoundariesEditor initial={getSections(sectionMap, "boundaries")} />;
    case "energy_patterns":
      return <EnergyPatternsEditor initial={getSections(sectionMap, "energy_patterns")} />;
    case "work_style":
      return <WorkStyleEditor initial={getSections(sectionMap, "work_style")} />;
    case "reflection_notes":
      return <ReflectionNotesEditor initial={getSections(sectionMap, "reflection_notes")} />;
    case "review_schedule":
      return <ReviewScheduleEditor initial={getSections(sectionMap, "review_schedule")} />;
    case "versions":
      return <VersionsPanel />;
    default:
      return <DashboardPanel sections={getAllSections(sectionMap)} />;
  }
}

export default memo(function EditorsRouter({ activeSection, sectionMap }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      {renderEditor(activeSection, sectionMap)}
    </Suspense>
  );
});

function getAllSections(sectionMap: Map<string, StrategySection[]>): StrategySection[] {
  const all: StrategySection[] = [];
  for (const list of sectionMap.values()) {
    all.push(...list);
  }
  return all;
}

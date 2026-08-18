"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { SegmentedControl, Stack, SimpleGrid, Skeleton } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { apiFetch } from "@/core/api/http";
import { useDayPlan } from "@/hooks/use-day-plan";
import {
  useDailyPlanner,
  useDailyGoal,
  useToggleDailyGoal,
  useDailyPriority,
  useUpdatePriorityStatus,
  useRemovePriority,
  useDailyNote,
  useComputeScore,
} from "@/hooks/use-daily-planner";
import { DayNavigation } from "@/modules/routines/components/DayNavigation";
import { MetricsHeader } from "@/modules/routines/components/MetricsHeader";
import { QuickAddBar } from "@/modules/routines/components/QuickAddBar";
import { CalendarGrid } from "@/modules/routines/components/CalendarGrid";
import { AgendaView } from "@/modules/routines/components/AgendaView";
import { DailySummary } from "./DailySummary";
import { DailyGoalSection } from "./DailyGoalSection";
import { DailyPrioritiesSection } from "./DailyPrioritiesSection";
import { DailyNotesSection } from "./DailyNotesSection";
import { EndOfDayReview } from "./EndOfDayReview";

export default function DailyPlannerContent() {
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [view, setView] = useState<"grid" | "agenda">("grid");

  const { data: plan, isLoading: planLoading, refetch: refetchDayPlan } = useDayPlan(selectedDate);
  const { data: planner, isLoading: plannerLoading, refetch: refetchPlanner } = useDailyPlanner(selectedDate);

  const setGoal = useDailyGoal();
  const toggleGoal = useToggleDailyGoal();
  const addPriority = useDailyPriority();
  const updatePriority = useUpdatePriorityStatus();
  const removePriority = useRemovePriority();
  const saveNote = useDailyNote();
  const computeScore = useComputeScore();

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const isToday = selectedDate === dayjs().format("YYYY-MM-DD");
  const isLoading = planLoading || plannerLoading;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <DayNavigation
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />

        {isLoading ? (
          <Skeleton height={140} radius="md" />
        ) : (
          <DailySummary
            date={selectedDate}
            productivityScore={planner?.snapshot?.productivityScore ?? null}
            tasksCompleted={planner?.snapshot?.tasksCompleted ?? 0}
            tasksTotal={planner?.snapshot?.tasksTotal ?? 0}
            focusMinutes={planner?.snapshot?.focusMinutes ?? 0}
            completionRate={plan?.metrics?.completionRate ?? 0}
            streak={0}
            dailyGoalTitle={planner?.goal?.title ?? null}
          />
        )}

        {/* Daily Goal + Top Priorities */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <DailyGoalSection
            goal={planner?.goal ?? null}
            onSetGoal={(title) => setGoal.mutate({ date: selectedDate, title })}
            onToggleGoal={(isCompleted) => {
              if (planner?.goal) {
                toggleGoal.mutate({ id: planner.goal.id, date: selectedDate, isCompleted });
              }
            }}
            isLoading={setGoal.isPending}
          />
          <DailyPrioritiesSection
            priorities={planner?.priorities ?? []}
            onAdd={(title) => addPriority.mutate({ date: selectedDate, title })}
            onToggle={(id, status) => updatePriority.mutate({ id, date: selectedDate, status })}
            onRemove={(id) => removePriority.mutate({ id, date: selectedDate })}
            isLoading={addPriority.isPending}
          />
        </SimpleGrid>

        {/* Metrics */}
        <MetricsHeader
          metrics={plan?.metrics ?? null}
          isLoading={planLoading}
          date={selectedDate}
        />

        {/* Quick Add */}
        <QuickAddBar
          date={selectedDate}
          onItemCreated={() => {
            refetchDayPlan();
            refetchPlanner();
          }}
        />

        {/* View toggle */}
        <SegmentedControl
          value={view}
          onChange={(v) => setView(v as "grid" | "agenda")}
          data={[
            { value: "grid", label: "Schedule" },
            { value: "agenda", label: "Agenda" },
          ]}
          size="xs"
        />

        {planLoading ? (
          <Stack gap="sm">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} height={48} radius="md" />
            ))}
          </Stack>
        ) : view === "grid" ? (
          <CalendarGrid
            items={plan?.items ?? []}
            date={selectedDate}
            onItemsChange={() => {
              refetchDayPlan();
              refetchPlanner();
            }}
          />
        ) : (
          <AgendaView
            items={plan?.items ?? []}
            date={selectedDate}
            onItemsChange={() => {
              refetchDayPlan();
              refetchPlanner();
            }}
          />
        )}

        {/* Notes */}
        <DailyNotesSection
          content={planner?.note?.content ?? null}
          onSave={(content) => saveNote.mutate({ date: selectedDate, content })}
          isLoading={saveNote.isPending}
        />

        {/* End-of-Day Review */}
        <EndOfDayReview
          currentReview={null}
          onSave={async (data) => {
            await apiFetch("/api/routines/daily-planner", {
              method: "POST",
              body: JSON.stringify({
                action: "computeScore",
                date: selectedDate,
              }),
            });
            refetchPlanner();
          }}
          isLoading={false}
        />
      </motion.div>
    </div>
  );
}

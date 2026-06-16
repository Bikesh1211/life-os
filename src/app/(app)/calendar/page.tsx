"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { SegmentedControl, Stack } from "@mantine/core";
import { useDayPlan } from "@/hooks/use-day-plan";
import { DayNavigation } from "@/modules/routines/components/DayNavigation";
import { MetricsHeader } from "@/modules/routines/components/MetricsHeader";
import { QuickAddBar } from "@/modules/routines/components/QuickAddBar";
import { CalendarGrid } from "@/modules/routines/components/CalendarGrid";
import { AgendaView } from "@/modules/routines/components/AgendaView";
import dayjs from "dayjs";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [view, setView] = useState<"grid" | "agenda">("grid");
  const { data: plan, isLoading, refetch } = useDayPlan(selectedDate);

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const isToday = selectedDate === dayjs().format("YYYY-MM-DD");

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

        <MetricsHeader
          metrics={plan?.metrics ?? null}
          isLoading={isLoading}
          date={selectedDate}
        />

        <QuickAddBar
          date={selectedDate}
          onItemCreated={() => refetch()}
        />

        <SegmentedControl
          value={view}
          onChange={(v) => setView(v as "grid" | "agenda")}
          data={[
            { value: "grid", label: "Calendar" },
            { value: "agenda", label: "Agenda" },
          ]}
          size="xs"
          className="mb-2"
        />

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-[var(--mantine-color-dark-6)]"
              />
            ))}
          </div>
        ) : view === "grid" ? (
          <CalendarGrid
            items={plan?.items ?? []}
            date={selectedDate}
            onItemsChange={() => refetch()}
          />
        ) : (
          <AgendaView
            items={plan?.items ?? []}
            date={selectedDate}
            onItemsChange={() => refetch()}
          />
        )}
      </motion.div>
    </div>
  );
}

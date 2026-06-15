"use client";

import { useEffect, useRef } from "react";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import { useTodayRoutine } from "@/hooks/use-today-routine";

const CHECK_INTERVAL = 30_000;
const REMINDER_LEAD_TIME = 10;

export function useRoutineNotifications() {
  const { data: todayRoutines } = useTodayRoutine();
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!todayRoutines || todayRoutines.length === 0) return;

    const interval = setInterval(() => {
      const now = dayjs();

      for (const routine of todayRoutines) {
        for (const item of routine.executionItems) {
          if (item.status !== "pending") continue;
          const itemStart = item.routineItem?.startTime ?? item.plannedStart;
          if (!itemStart) continue;

          const [h, m] = itemStart.split(":").map(Number);
          const startTime = now.hour(h).minute(m).second(0);

          const diffMinutes = startTime.diff(now, "minute");
          const reminderKey = `${item.id}_reminder`;

          if (diffMinutes <= REMINDER_LEAD_TIME && diffMinutes > 0 && !notifiedRef.current.has(reminderKey)) {
            notifiedRef.current.add(reminderKey);
            notifications.show({
              title: `Coming up: ${item.routineItem?.title}`,
              message: `${item.routineItem?.title} starts in ${diffMinutes} minutes`,
              color: "blue",
              autoClose: 10_000,
            });
          }

          const startKey = `${item.id}_start`;
          if (diffMinutes <= 1 && diffMinutes > -1 && !notifiedRef.current.has(startKey)) {
            notifiedRef.current.add(startKey);
            notifications.show({
              title: `Time to start: ${item.routineItem?.title}`,
              message: `${item.routineItem?.title} is scheduled now`,
              color: "green",
              autoClose: 15_000,
            });
          }

          const overdueKey = `${item.id}_overdue`;
          if (diffMinutes < -5 && !notifiedRef.current.has(overdueKey)) {
            notifiedRef.current.add(overdueKey);
            notifications.show({
              title: `Overdue: ${item.routineItem?.title}`,
              message: `${item.routineItem?.title} was scheduled ${Math.abs(diffMinutes)} minutes ago`,
              color: "orange",
              autoClose: 15_000,
            });
          }
        }
      }
    }, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [todayRoutines]);
}

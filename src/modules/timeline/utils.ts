import dayjs from "dayjs";

// ─── Duration helpers (pure, client-safe) ────────────────────────

export type DurationBreakdown = {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  totalDays: number;
  isPast: boolean;
};

export function computeDuration(eventDate: Date): DurationBreakdown {
  const now = dayjs();
  const target = dayjs(eventDate);
  const isPast = target.isBefore(now);

  const [start, end] = isPast ? [target, now] : [now, target];

  const years = end.diff(start, "year");
  const months = end.diff(start.add(years, "year"), "month");
  const weeks = end.diff(start.add(years, "year").add(months, "month"), "week");
  const totalDays = end.diff(start, "day");
  const days = end.diff(
    start.add(years, "year").add(months, "month").add(weeks, "week"),
    "day",
  );
  const hours = end.diff(
    start
      .add(years, "year")
      .add(months, "month")
      .add(weeks, "week")
      .add(days, "day"),
    "hour",
  );
  const minutes = end.diff(
    start
      .add(years, "year")
      .add(months, "month")
      .add(weeks, "week")
      .add(days, "day")
      .add(hours, "hour"),
    "minute",
  );

  return { years, months, weeks, days, hours, minutes, totalDays, isPast };
}

export function getPrimaryUnit(duration: DurationBreakdown): {
  value: number;
  unit: string;
  label: string;
} {
  if (duration.years > 0) {
    return {
      value: duration.years,
      unit: duration.years === 1 ? "year" : "years",
      label: duration.isPast ? "Since" : "Remaining",
    };
  }
  if (duration.months > 0) {
    return {
      value: duration.months,
      unit: duration.months === 1 ? "month" : "months",
      label: duration.isPast ? "Since" : "Remaining",
    };
  }
  if (duration.weeks > 0) {
    return {
      value: duration.weeks,
      unit: duration.weeks === 1 ? "week" : "weeks",
      label: duration.isPast ? "Since" : "Remaining",
    };
  }
  if (duration.days > 0) {
    return {
      value: duration.days,
      unit: duration.days === 1 ? "day" : "days",
      label: duration.isPast ? "Since" : "Remaining",
    };
  }
  if (duration.hours > 0) {
    return {
      value: duration.hours,
      unit: duration.hours === 1 ? "hour" : "hours",
      label: duration.isPast ? "Since" : "Remaining",
    };
  }
  return {
    value: duration.minutes,
    unit: duration.minutes === 1 ? "minute" : "minutes",
    label: duration.isPast ? "Since" : "Remaining",
  };
}

export function computeNextOccurrence(
  eventDate: Date,
  recurrence: string,
): Date | null {
  if (recurrence === "none") return eventDate;

  const now = dayjs();
  const date = dayjs(eventDate);

  if (date.isAfter(now)) return eventDate;

  let current = date;
  const maxIterations = 1000;
  let iterations = 0;

  while (current.isBefore(now) && iterations < maxIterations) {
    switch (recurrence) {
      case "daily":
        current = current.add(1, "day");
        break;
      case "weekly":
        current = current.add(1, "week");
        break;
      case "monthly":
        current = current.add(1, "month");
        break;
      case "yearly":
        current = current.add(1, "year");
        break;
      default:
        return null;
    }
    iterations++;
  }

  return current.toDate();
}

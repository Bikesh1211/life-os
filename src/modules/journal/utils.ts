export function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const sorted = dates
    .map((d) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date;
    })
    .sort((a, b) => b.getTime() - a.getTime());

  const uniqueDates: Date[] = [];
  for (const date of sorted) {
    const prev = uniqueDates[uniqueDates.length - 1];
    if (!prev || date.getTime() !== prev.getTime()) {
      uniqueDates.push(date);
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mostRecent = uniqueDates[0];
  const diffDays = Math.floor(
    (today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays > 1) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = uniqueDates[i - 1];
    const currDate = uniqueDates[i];
    const dayDiff = Math.floor(
      (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (dayDiff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function computeReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getMoodEmoji(mood: string): string {
  const map: Record<string, string> = {
    happy: "😊",
    sad: "😢",
    neutral: "😐",
    anxious: "😰",
    stressed: "😫",
    motivated: "🔥",
    excited: "🎉",
  };
  return map[mood] ?? "📝";
}

export function getMoodColor(mood: string): string {
  const map: Record<string, string> = {
    happy: "var(--mantine-color-yellow-5)",
    sad: "var(--mantine-color-indigo-5)",
    neutral: "var(--mantine-color-gray-5)",
    anxious: "var(--mantine-color-orange-5)",
    stressed: "var(--mantine-color-red-5)",
    motivated: "var(--mantine-color-lime-5)",
    excited: "var(--mantine-color-violet-5)",
  };
  return map[mood] ?? "var(--mantine-color-gray-5)";
}

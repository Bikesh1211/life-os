export const SCHEDULE_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type ScheduleDay = (typeof SCHEDULE_DAYS)[number];

export const WEEKDAYS: ScheduleDay[] = ["mon", "tue", "wed", "thu", "fri"];
export const WEEKENDS: ScheduleDay[] = ["sat", "sun"];

export type SystemTemplate = {
  name: string;
  description: string;
  color: string;
  icon: string;
  scheduleType: "daily" | "weekdays" | "weekends" | "custom";
  customDays?: string[];
  items: Array<{
    title: string;
    description?: string;
    startTime: string;
    endTime?: string;
    order: number;
    isOptional: boolean;
  }>;
};

export const SYSTEM_TEMPLATES: SystemTemplate[] = [
  {
    name: "Morning Routine",
    description: "Start your day with structure and purpose",
    color: "#f59e0b",
    icon: "sunrise",
    scheduleType: "daily",
    items: [
      { title: "Wake Up", startTime: "06:00", endTime: "06:15", order: 0, isOptional: false },
      { title: "Morning Stretch", startTime: "06:15", endTime: "06:30", order: 1, isOptional: true },
      { title: "Shower & Get Ready", startTime: "06:30", endTime: "07:00", order: 2, isOptional: false },
      { title: "Breakfast", startTime: "07:00", endTime: "07:30", order: 3, isOptional: false },
      { title: "Plan the Day", startTime: "07:30", endTime: "07:45", order: 4, isOptional: true },
      { title: "Start Deep Work", startTime: "08:00", endTime: "10:00", order: 5, isOptional: false },
    ],
  },
  {
    name: "Student Routine",
    description: "Balanced study schedule for productivity and rest",
    color: "#3b82f6",
    icon: "book",
    scheduleType: "weekdays",
    items: [
      { title: "Wake Up", startTime: "06:30", endTime: "06:45", order: 0, isOptional: false },
      { title: "Morning Review", startTime: "07:00", endTime: "08:00", order: 1, isOptional: false },
      { title: "Lecture / Study Block 1", startTime: "08:00", endTime: "10:00", order: 2, isOptional: false },
      { title: "Break", startTime: "10:00", endTime: "10:15", order: 3, isOptional: false },
      { title: "Study Block 2", startTime: "10:15", endTime: "12:15", order: 4, isOptional: false },
      { title: "Lunch", startTime: "12:15", endTime: "13:00", order: 5, isOptional: false },
      { title: "Study Block 3", startTime: "13:00", endTime: "15:00", order: 6, isOptional: false },
      { title: "Break / Exercise", startTime: "15:00", endTime: "16:00", order: 7, isOptional: true },
      { title: "Assignments", startTime: "16:00", endTime: "18:00", order: 8, isOptional: false },
      { title: "Dinner", startTime: "19:00", endTime: "19:30", order: 9, isOptional: false },
      { title: "Revision", startTime: "20:00", endTime: "21:30", order: 10, isOptional: true },
      { title: "Sleep", startTime: "22:30", endTime: "06:30", order: 11, isOptional: false },
    ],
  },
  {
    name: "Deep Work Routine",
    description: "Maximize focus with structured deep work sessions",
    color: "#8b5cf6",
    icon: "brain",
    scheduleType: "weekdays",
    items: [
      { title: "Wake Up & Morning Routine", startTime: "06:00", endTime: "07:00", order: 0, isOptional: false },
      { title: "Deep Work Session 1", startTime: "07:00", endTime: "09:00", order: 1, isOptional: false },
      { title: "Break", startTime: "09:00", endTime: "09:15", order: 2, isOptional: false },
      { title: "Deep Work Session 2", startTime: "09:15", endTime: "11:15", order: 3, isOptional: false },
      { title: "Shallow Work (Emails/Admin)", startTime: "11:15", endTime: "12:00", order: 4, isOptional: true },
      { title: "Lunch & Walk", startTime: "12:00", endTime: "13:00", order: 5, isOptional: false },
      { title: "Deep Work Session 3", startTime: "13:00", endTime: "15:00", order: 6, isOptional: false },
      { title: "Afternoon Break", startTime: "15:00", endTime: "15:15", order: 7, isOptional: true },
      { title: "Review & Plan Tomorrow", startTime: "15:15", endTime: "16:00", order: 8, isOptional: false },
      { title: "Wind Down", startTime: "21:00", endTime: "22:00", order: 9, isOptional: false },
    ],
  },
  {
    name: "Fitness Routine",
    description: "Active lifestyle routine with workouts and recovery",
    color: "#10b981",
    icon: "run",
    scheduleType: "custom",
    customDays: ["mon", "tue", "thu", "fri", "sat"],
    items: [
      { title: "Wake Up & Hydrate", startTime: "05:30", endTime: "05:45", order: 0, isOptional: false },
      { title: "Morning Workout", startTime: "05:45", endTime: "06:45", order: 1, isOptional: false },
      { title: "Shower & Get Ready", startTime: "06:45", endTime: "07:15", order: 2, isOptional: false },
      { title: "Protein Breakfast", startTime: "07:15", endTime: "07:45", order: 3, isOptional: false },
      { title: "Work / Study", startTime: "08:00", endTime: "12:00", order: 4, isOptional: false },
      { title: "Lunch", startTime: "12:00", endTime: "12:30", order: 5, isOptional: false },
      { title: "Work / Study", startTime: "12:30", endTime: "17:00", order: 6, isOptional: false },
      { title: "Evening Stretch", startTime: "17:00", endTime: "17:30", order: 7, isOptional: true },
      { title: "Dinner", startTime: "19:00", endTime: "19:30", order: 8, isOptional: false },
      { title: "Sleep", startTime: "21:30", endTime: "05:30", order: 9, isOptional: false },
    ],
  },
  {
    name: "Evening Routine",
    description: "Wind down and prepare for a restful night",
    color: "#6366f1",
    icon: "moon",
    scheduleType: "daily",
    items: [
      { title: "Evening Walk", startTime: "18:00", endTime: "18:30", order: 0, isOptional: true },
      { title: "Dinner", startTime: "19:00", endTime: "19:30", order: 1, isOptional: false },
      { title: "Tidy Up", startTime: "19:30", endTime: "20:00", order: 2, isOptional: true },
      { title: "Screen-Free Time", startTime: "20:00", endTime: "21:00", order: 3, isOptional: false },
      { title: "Journal / Reflect", startTime: "21:00", endTime: "21:15", order: 4, isOptional: true },
      { title: "Plan Tomorrow", startTime: "21:15", endTime: "21:30", order: 5, isOptional: false },
      { title: "Wind Down Routine", startTime: "21:30", endTime: "22:00", order: 6, isOptional: false },
      { title: "Sleep", startTime: "22:00", endTime: "06:00", order: 7, isOptional: false },
    ],
  },
];

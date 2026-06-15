export const ACTIVITY_TYPE_SUGGESTIONS: Record<string, string[]> = {
  food: ["Breakfast", "Lunch", "Dinner", "Snacks", "Coffee", "Tea", "Restaurant Visit"],
  health: ["Walking", "Running", "Gym", "Cycling", "Yoga", "Sports", "Meditation", "Stretching"],
  career: ["Coding", "Meeting", "Research", "Project Work", "Learning", "Planning", "Writing", "Email"],
  education: ["Reading", "Course", "Practice", "Tutorial", "Study Session", "Exam"],
  finance: ["Shopping", "Bills", "Budget Review", "Investment", "Banking"],
  travel: ["Driving", "Public Transport", "Flight", "Road Trip", "Exploring"],
  relationships: ["Friends", "Family Time", "Date", "Networking", "Call", "Event"],
  business: ["Client Meeting", "Strategy", "Marketing", "Product Work", "Sales"],
  entertainment: ["Movie", "TV Show", "Gaming", "Music", "Reading Fiction", "Streaming"],
  personal: ["Cleaning", "Cooking", "Grooming", "Laundry", "Errands", "Planning", "Journaling"],
};

export const DEFAULT_MOOD_OPTIONS = [
  { value: 1, label: "Terrible", emoji: "😫" },
  { value: 2, label: "Bad", emoji: "😟" },
  { value: 3, label: "Okay", emoji: "😐" },
  { value: 4, label: "Good", emoji: "😊" },
  { value: 5, label: "Great", emoji: "🤩" },
] as const;

export const DEFAULT_ENERGY_OPTIONS = [
  { value: 1, label: "Exhausted", emoji: "🪫" },
  { value: 2, label: "Low", emoji: "🔋" },
  { value: 3, label: "Moderate", emoji: "⚡" },
  { value: 4, label: "High", emoji: "🔥" },
  { value: 5, label: "Limitless", emoji: "💫" },
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  personal: "IconUser",
  career: "IconBriefcase",
  education: "IconSchool",
  health: "IconHeart",
  finance: "IconCoin",
  travel: "IconPlane",
  relationships: "IconUsers",
  business: "IconBuildingStore",
  entertainment: "IconPlayerPlay",
  custom: "IconStar",
};

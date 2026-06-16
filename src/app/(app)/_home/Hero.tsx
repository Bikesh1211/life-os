"use client";

import { useState, useEffect } from "react";
import { Text, Title, Tooltip, ActionIcon, Group, Paper, rem } from "@mantine/core";
import { IconHeart, IconHeartFilled, IconShare, IconSparkles } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

const quotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "You don't have to be extreme, just consistent.", author: "Unknown" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "It is not daily increase but daily decrease — hack away at the unessential.", author: "Bruce Lee" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", emoji: "☀️" };
  if (hour < 17) return { text: "Good Afternoon", emoji: "🌤️" };
  if (hour < 21) return { text: "Good Evening", emoji: "🌅" };
  return { text: "Good Night", emoji: "🌙" };
}

function getDailyQuote() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const dayOfYear = Math.floor((start.getTime() - new Date(start.getFullYear(), 0, 0).getTime()) / 86400000);
  return quotes[dayOfYear % quotes.length];
}

export function Hero() {
  const greeting = getGreeting();
  const [quote] = useState(getDailyQuote);
  const [favorited, setFavorited] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="mb-10">
        <div className="h-12 w-72 rounded-lg bg-white/5 animate-pulse mb-3" />
        <div className="h-5 w-96 rounded bg-white/5 animate-pulse" />
      </div>
    );
  }

  const firstName = "Bikesh";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="mb-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Title
          order={1}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
          style={{
            background: "linear-gradient(135deg, var(--mantine-color-bright), var(--mantine-color-dimmed))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {greeting.text}, {firstName}. {greeting.emoji}
        </Title>
        <Text size="lg" c="dimmed" className="mt-1">
          Ready to make today meaningful?
        </Text>
      </motion.div>

      {/* Quote card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-6"
      >
        <Paper
          withBorder
          p="md"
          radius="lg"
          className="backdrop-blur-xl"
          style={{
            background: "rgba(var(--mantine-color-body-rgb), 0.4)",
            maxWidth: 600,
          }}
        >
          <Group gap="sm" wrap="nowrap" align="flex-start">
            <IconSparkles
              size={20}
              style={{ color: "var(--mantine-color-blue-5)", flexShrink: 0, marginTop: 2 }}
            />
            <div style={{ flex: 1 }}>
              <Text size="sm" style={{ fontStyle: "italic", lineHeight: 1.6 }}>
                &ldquo;{quote.text}&rdquo;
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                — {quote.author}
              </Text>
            </div>
            <Group gap={2} wrap="nowrap" style={{ flexShrink: 0 }}>
              <Tooltip label={favorited ? "Saved" : "Save quote"}>
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  color={favorited ? "red" : "gray"}
                  onClick={() => setFavorited(!favorited)}
                >
                  {favorited ? <IconHeartFilled size={14} /> : <IconHeart size={14} />}
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Share">
                <ActionIcon variant="subtle" size="sm" color="gray">
                  <IconShare size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Paper>
      </motion.div>
    </motion.div>
  );
}
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Stack, Group, Text, Button, Paper, Card, Title, Badge, TextInput,
  NumberInput, Textarea, SimpleGrid, Chip, ActionIcon, Slider,
} from "@mantine/core";
import {
  IconArrowLeft, IconPlayerPlay, IconPlayerPause, IconPlayerStop,
  IconPlayerSkipForward, IconRefresh, IconClock, IconStar,
  IconMoodHappy, IconUserCircle,
} from "@tabler/icons-react";

type Script = {
  id: string;
  title: string;
};

type Section = {
  id: string;
  title: string;
  content: any;
};

type Props = {
  scriptId: string;
};

export function PracticeView({ scriptId }: Props) {
  const router = useRouter();
  const [script, setScript] = useState<Script | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [isPracticing, setIsPracticing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [confidence, setConfidence] = useState(7);
  const [rating, setRating] = useState(7);
  const [voiceQuality, setVoiceQuality] = useState(7);
  const [eyeContact, setEyeContact] = useState(7);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [bodyLanguage, setBodyLanguage] = useState("");
  const [improvements, setImprovements] = useState("");
  const [sectionsPracticed, setSectionsPracticed] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/scripts/${scriptId}`)
      .then((r) => r.json())
      .then((data) => {
        const { sections: scts, ...scr } = data;
        setScript(scr);
        setSections(scts ?? []);
      });
  }, [scriptId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartPractice = useCallback(() => {
    setIsPracticing(true);
    setTimer(0);
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
  }, []);

  const handlePausePractice = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPracticing(false);
  }, []);

  const handleStopPractice = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPracticing(false);
    const section = sections[currentSectionIdx];
    if (section && !sectionsPracticed.includes(section.title)) {
      setSectionsPracticed([...sectionsPracticed, section.title]);
    }
    setShowForm(true);
  }, [currentSectionIdx, sections, sectionsPracticed]);

  const handleRestart = useCallback(() => {
    setTimer(0);
    setCurrentSectionIdx(0);
    setShowForm(false);
    setConfidence(7);
    setRating(7);
    setVoiceQuality(7);
    setEyeContact(7);
    setMistakes([]);
    setBodyLanguage("");
    setImprovements("");
    setSectionsPracticed([]);
  }, []);

  const handleSaveSession = useCallback(async () => {
    await fetch(`/api/scripts/${scriptId}/practice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        durationSeconds: timer,
        confidence,
        rating,
        voiceQuality,
        eyeContact,
        mistakes,
        bodyLanguageNotes: bodyLanguage,
        improvements,
        sectionsPracticed,
      }),
    });
    handleRestart();
  }, [scriptId, timer, confidence, rating, voiceQuality, eyeContact, mistakes, bodyLanguage, improvements, sectionsPracticed, handleRestart]);

  const commonMistakes = ["Forgot line", "Stammered", "Lost place", "Spoke too fast", "Spoke too slow", "Monotone", "Fidgeted", "No pauses", "Eye contact lost"];
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const sliderMarks = [
    { value: 1, label: "1" },
    { value: 10, label: "10" },
  ];

  if (!script) return null;

  return (
    <Stack gap="md" p="md">
      <Group>
        <ActionIcon variant="subtle" onClick={() => router.push(`/studio/scripts/${scriptId}/write`)}>
          <IconArrowLeft size={18} />
        </ActionIcon>
        <Title order={4}>{script.title} — Practice</Title>
      </Group>

      {!showForm ? (
        <>
          {/* Timer & Controls */}
          <Paper withBorder p="xl" radius="md" ta="center">
            <Text size="64px" fw={700} style={{ fontFamily: "monospace" }}>
              {minutes}:{seconds.toString().padStart(2, "0")}
            </Text>
            <Group justify="center" mt="md">
              {!isPracticing ? (
                <Button size="lg" leftSection={<IconPlayerPlay size={20} />} onClick={handleStartPractice}>
                  Start
                </Button>
              ) : (
                <>
                  <Button size="lg" variant="light" leftSection={<IconPlayerPause size={20} />} onClick={handlePausePractice}>
                    Pause
                  </Button>
                  <Button size="lg" color="red" leftSection={<IconPlayerStop size={20} />} onClick={handleStopPractice}>
                    Stop
                  </Button>
                </>
              )}
              <Button size="lg" variant="subtle" leftSection={<IconRefresh size={20} />} onClick={handleRestart}>
                Restart
              </Button>
            </Group>
          </Paper>

          {/* Section navigation */}
          <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
              <Group>
                <Button
                  variant="light"
                  disabled={currentSectionIdx === 0}
                  onClick={() => setCurrentSectionIdx((i) => i - 1)}
                >
                  Previous
                </Button>
                <Text fw={500}>{sections[currentSectionIdx]?.title ?? "No sections"}</Text>
                <Button
                  variant="light"
                  disabled={currentSectionIdx >= sections.length - 1}
                  onClick={() => {
                    const section = sections[currentSectionIdx];
                    setCurrentSectionIdx((i) => i + 1);
                    if (section) {
                      setSectionsPracticed([...sectionsPracticed, section.title]);
                    }
                  }}
                >
                  Next
                </Button>
              </Group>
              <Badge variant="light" color="blue">
                Section {currentSectionIdx + 1} of {sections.length}
              </Badge>
            </Group>
          </Paper>

          {/* Section content */}
          <Paper withBorder p="xl" radius="md" ref={autoScrollRef} style={{ minHeight: 300 }}>
            <Text size="lg" style={{ lineHeight: 1.8 }}>
              {sections[currentSectionIdx]?.content ? JSON.stringify(sections[currentSectionIdx].content).slice(0, 200) : "Select a section"}
            </Text>
          </Paper>
        </>
      ) : (
        <Paper withBorder p="lg" radius="md">
          <Title order={4} mb="md">Session Review</Title>

          <SimpleGrid cols={{ base: 1, md: 2 }} mb="md">
            <div>
              <Text size="sm" mb="xs">Duration: {minutes}:{seconds.toString().padStart(2, "0")}</Text>
              <Text size="sm" mb="xs">Confidence: {confidence}/10</Text>
              <Slider value={confidence} onChange={setConfidence} min={1} max={10} step={1} marks={sliderMarks} mb="md" />
              <Text size="sm" mb="xs">Rating: {rating}/10</Text>
              <Slider value={rating} onChange={setRating} min={1} max={10} step={1} marks={sliderMarks} mb="md" />
            </div>
            <div>
              <Text size="sm" mb="xs">Voice Quality: {voiceQuality}/10</Text>
              <Slider value={voiceQuality} onChange={setVoiceQuality} min={1} max={10} step={1} marks={sliderMarks} mb="md" />
              <Text size="sm" mb="xs">Eye Contact: {eyeContact}/10</Text>
              <Slider value={eyeContact} onChange={setEyeContact} min={1} max={10} step={1} marks={sliderMarks} mb="md" />
            </div>
          </SimpleGrid>

          <Text size="sm" mb="xs">Mistakes</Text>
          <Chip.Group multiple value={mistakes} onChange={setMistakes}>
            <Group gap="xs" mb="md">
              {commonMistakes.map((m) => (
                <Chip key={m} value={m} size="sm">{m}</Chip>
              ))}
            </Group>
          </Chip.Group>

          <Textarea
            label="Body Language Notes"
            value={bodyLanguage}
            onChange={(e) => setBodyLanguage(e.currentTarget.value)}
            mb="md"
            minRows={2}
          />

          <Textarea
            label="Improvements"
            value={improvements}
            onChange={(e) => setImprovements(e.currentTarget.value)}
            mb="lg"
            minRows={2}
            placeholder="What to improve next time..."
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={handleRestart}>Discard</Button>
            <Button onClick={handleSaveSession}>Save Session</Button>
          </Group>
        </Paper>
      )}
    </Stack>
  );
}

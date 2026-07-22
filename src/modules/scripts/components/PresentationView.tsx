"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Stack, Group, Text, Button, Paper, ActionIcon, Badge, Title,
  Tooltip, Progress,
} from "@mantine/core";
import {
  IconArrowLeft, IconPlayerPlay, IconPlayerPause, IconPlayerSkipForward,
  IconPlayerSkipBack, IconSun, IconMoon, IconLayoutCards,
  IconEye as IconEyeContact,
} from "@tabler/icons-react";

type Section = {
  id: string;
  title: string;
  content: any;
  wordCount: number;
  estimatedDurationSeconds: number;
  speakerNotes: any;
};

type Script = {
  id: string;
  title: string;
};

type Props = {
  scriptId: string;
};

export function PresentationView({ scriptId }: Props) {
  const router = useRouter();
  const [script, setScript] = useState<Script | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [compact, setCompact] = useState(false);
  const [dark, setDark] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
    } else {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
      setIsRunning(true);
    }
  }, [isRunning]);

  const currentSection = sections[currentSectionIdx];
  const progress = sections.length > 0 ? ((currentSectionIdx + 1) / sections.length) * 100 : 0;
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  const extractText = (doc: any): string => {
    if (!doc) return "";
    const parts: string[] = [];
    const stack = [doc];
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (node.text) parts.push(node.text);
      if (node.content && Array.isArray(node.content)) {
        for (let i = node.content.length - 1; i >= 0; i--) {
          stack.push(node.content[i]);
        }
      }
    }
    return parts.join(" ");
  };

  if (!script) return null;

  return (
    <Paper
      style={{
        height: "100vh",
        background: dark ? "#1a1a1a" : "#f8f9fa",
        color: dark ? "#e0e0e0" : "#1a1a1a",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Georgia, serif",
      }}
    >
      {/* Top bar */}
      <Group justify="space-between" p="md" style={{ borderBottom: dark ? "1px solid #333" : "1px solid #e0e0e0" }}>
        <Group>
          <ActionIcon variant="subtle" onClick={() => router.back()}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Text fw={600}>{script.title}</Text>
        </Group>
        <Group>
          <Badge variant="light">{currentSection?.title}</Badge>
          <Text size="sm">{minutes}:{seconds.toString().padStart(2, "0")}</Text>
          <Tooltip label={isRunning ? "Pause" : "Start"}>
            <ActionIcon variant="light" onClick={toggleTimer}>
              {isRunning ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />}
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Previous section">
            <ActionIcon variant="light" onClick={() => setCurrentSectionIdx((i) => Math.max(0, i - 1))}>
              <IconPlayerSkipBack size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Next section">
            <ActionIcon variant="light" onClick={() => setCurrentSectionIdx((i) => Math.min(sections.length - 1, i + 1))}>
              <IconPlayerSkipForward size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={compact ? "Full view" : "Compact view"}>
            <ActionIcon variant="light" onClick={() => setCompact(!compact)}>
              <IconLayoutCards size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={dark ? "Light mode" : "Dark mode"}>
            <ActionIcon variant="light" onClick={() => setDark(!dark)}>
              {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Progress bar */}
      <Progress value={progress} size="sm" color="blue" />

      {/* Content area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Main content */}
        <div
          style={{
            flex: 2,
            padding: "60px 80px",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Text
            size={compact ? "lg" : "xl"}
            style={{ lineHeight: 1.8, fontSize: compact ? 18 : 24 }}
          >
            {currentSection ? extractText(currentSection.content) : "No content"}
          </Text>
        </div>

        {/* Next section preview */}
        <div
          style={{
            flex: 1,
            padding: "40px",
            borderLeft: dark ? "1px solid #333" : "1px solid #e0e0e0",
            overflow: "auto",
            background: dark ? "#222" : "#fff",
          }}
        >
          {currentSectionIdx + 1 < sections.length ? (
            <>
              <Text size="sm" c="dimmed" mb="sm">Up next: {sections[currentSectionIdx + 1].title}</Text>
              <Text size="sm" style={{ lineHeight: 1.6, opacity: 0.7 }}>
                {extractText(sections[currentSectionIdx + 1].content).slice(0, 300)}
              </Text>
            </>
          ) : (
            <Text size="sm" c="dimmed">End of script</Text>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <Group justify="space-between" p="md" style={{ borderTop: dark ? "1px solid #333" : "1px solid #e0e0e0" }}>
        <Text size="sm" c="dimmed">
          Section {currentSectionIdx + 1} of {sections.length}
        </Text>
        <Text size="sm" c="dimmed">
          {currentSection?.wordCount ?? 0} words · Est. {Math.round((currentSection?.estimatedDurationSeconds ?? 0) / 60)}m
        </Text>
      </Group>
    </Paper>
  );
}

"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, ActionIcon, Tooltip, Group, Stack, Text, Paper, ScrollArea, Menu } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconArticle,
  IconMinimize,
  IconMaximize,
  IconListTree,
  IconVersions,
  IconFileExport,
  IconMarkdown,
  IconFileCode,
} from "@tabler/icons-react";
import { Editor } from "@/components/editor";
import { textToEditorContent } from "@/components/editor/utils";

type JournalEditorProps = {
  initialTitle?: string;
  initialContent?: string;
  entryId?: string;
};

function OutlineSidebar({ content }: { content: unknown }) {
  const headings = useMemo(() => {
    const items: { level: number; text: string }[] = [];
    const walk = (node: Record<string, unknown>) => {
      if (node.type === "heading" && typeof node.level === "number" && typeof node.text === "string") {
        items.push({ level: node.level, text: node.text });
      }
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach((child: unknown) => walk(child as Record<string, unknown>));
      }
    };
    if (content && typeof content === "object") walk(content as Record<string, unknown>);
    return items;
  }, [content]);

  if (headings.length === 0) {
    return (
      <Stack align="center" gap="xs" p="md">
        <IconListTree size={20} opacity={0.3} />
        <Text size="xs" c="dimmed">No headings yet</Text>
      </Stack>
    );
  }

  return (
    <Stack gap={2} p="xs">
      <Text size="xs" fw={600} c="dimmed" mb="xs" px="xs">OUTLINE</Text>
      {headings.map((h, i) => (
        <Text
          key={i}
          size="xs"
          lineClamp={1}
          pl={h.level * 12}
          style={{
            cursor: "pointer",
            padding: "4px 6px",
            borderRadius: 4,
            fontSize: h.level === 1 ? 13 : 12,
            fontWeight: h.level === 1 ? 600 : 400,
          }}
        >
          {h.text}
        </Text>
      ))}
    </Stack>
  );
}

export function JournalEditor({
  initialTitle = "",
  initialContent = "",
  entryId,
}: JournalEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [contentJson, setContentJson] = useState<unknown>(textToEditorContent(initialContent));
  const [contentText, setContentText] = useState(initialContent);
  const [focusMode, setFocusMode] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(false);

  const handleSave = useCallback(async () => {
    setLoading(true);
    try {
      const url = entryId ? `/api/journal/${entryId}` : "/api/journal";
      const method = entryId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: contentText }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      notifications.show({
        title: entryId ? "Updated" : "Created",
        message: `"${title}" saved successfully.`,
        color: "green",
      });
      if (!entryId) {
        router.replace(`/journal/${data.id}`);
      } else {
        router.refresh();
      }
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to save entry",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, [title, contentText, entryId, router]);

  const handleSaveVersion = useCallback(async () => {
    if (!entryId) return;
    try {
      const res = await fetch(`/api/journal/${entryId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to save version");
      notifications.show({ title: "Version saved", message: "Snapshot created", color: "green" });
    } catch {
      notifications.show({ title: "Error", message: "Failed to save version", color: "red" });
    }
  }, [entryId]);

  const handleExportMarkdown = useCallback(async () => {
    if (!entryId) return;
    try {
      const res = await fetch(`/api/journal/${entryId}/export/markdown`);
      if (!res.ok) throw new Error("Failed to export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `journal-entry-${entryId}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      notifications.show({ title: "Error", message: "Failed to export", color: "red" });
    }
  }, [entryId]);

  const handleExportJson = useCallback(async () => {
    if (!entryId) return;
    try {
      const res = await fetch(`/api/journal/${entryId}/export/json`);
      if (!res.ok) throw new Error("Failed to export");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `journal-entry-${entryId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      notifications.show({ title: "Error", message: "Failed to export", color: "red" });
    }
  }, [entryId]);

  useHotkeys([
    ["mod+Shift+f", () => setFocusMode((v) => !v)],
    ["mod+Shift+z", () => setZenMode((v) => !v)],
    ["mod+Shift+o", () => setOutlineOpen((v) => !v)],
    ["mod+Shift+s", () => handleSave()],
  ]);

  if (zenMode) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <Group px="md" py={4} justify="space-between" style={{ flexShrink: 0 }}>
          <Text size="xs" c="dimmed">{title || "Untitled"}</Text>
          <Group gap={4}>
            <Tooltip label="Exit zen mode (⌘⇧Z)">
              <ActionIcon variant="subtle" size="sm" onClick={() => setZenMode(false)}>
                <IconMaximize size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
        <div style={{ flex: 1, overflow: "auto", padding: "0 15%" }}>
          <Editor
            content={contentJson}
            onChange={(json, _html, text) => {
              setContentJson(json);
              setContentText(text);
            }}
            minHeight="100%"
            placeholder="Start writing..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen flex-col px-4 py-4" style={{
      maxWidth: focusMode ? "100%" : undefined,
    }}>
      <div className="mb-4 flex items-center justify-between flex-shrink-0">
        <Group gap={4}>
          <button
            onClick={() => router.push("/journal")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <IconArrowLeft size={16} />
            Back
          </button>
          {!focusMode && (
            <>
              <Tooltip label="Focus mode (⌘⇧F)">
                <ActionIcon variant={focusMode ? "filled" : "subtle"} size="sm" onClick={() => setFocusMode((v) => !v)}>
                  <IconMinimize size={14} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Zen mode (⌘⇧Z)">
                <ActionIcon variant={zenMode ? "filled" : "subtle"} size="sm" onClick={() => setZenMode(true)}>
                  <IconArticle size={14} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Outline (⌘⇧O)">
                <ActionIcon variant={outlineOpen ? "filled" : "subtle"} size="sm" onClick={() => setOutlineOpen((v) => !v)}>
                  <IconListTree size={14} />
                </ActionIcon>
              </Tooltip>
            </>
          )}
        </Group>

        <Group gap={4}>
          {entryId && (
            <>
              <Tooltip label="Save version">
                <ActionIcon variant="subtle" size="sm" onClick={handleSaveVersion}>
                  <IconVersions size={14} />
                </ActionIcon>
              </Tooltip>
              <Menu withinPortal>
                <Menu.Target>
                  <Tooltip label="Export">
                    <ActionIcon variant="subtle" size="sm">
                      <IconFileExport size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection={<IconMarkdown size={14} />} onClick={handleExportMarkdown}>
                    Export as Markdown
                  </Menu.Item>
                  <Menu.Item leftSection={<IconFileCode size={14} />} onClick={handleExportJson}>
                    Export as JSON
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="cursor-pointer rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : entryId ? "Update" : "Save"}
          </button>
        </Group>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", gap: outlineOpen ? 16 : 0 }}>
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          maxWidth: focusMode ? 960 : undefined,
          margin: focusMode ? "0 auto" : undefined,
          width: "100%",
        }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            placeholder="Title"
            className="w-full border-0 bg-transparent text-2xl font-bold outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
            autoFocus
          />

          <div className="my-3 h-px bg-gray-200 dark:bg-gray-700" />

          <div className="flex-1 overflow-y-auto">
            <Editor
              content={contentJson}
              onChange={(json, _html, text) => {
                setContentJson(json);
                setContentText(text);
              }}
              placeholder="Write your thoughts..."
              minHeight="360px"
            />
          </div>
        </div>

        {outlineOpen && (
          <Paper
            style={{
              width: 220,
              borderLeft: "1px solid var(--mantine-color-default-border)",
              flexShrink: 0,
              overflow: "auto",
            }}
          >
            <OutlineSidebar content={contentJson} />
          </Paper>
        )}
      </div>
    </div>
  );
}

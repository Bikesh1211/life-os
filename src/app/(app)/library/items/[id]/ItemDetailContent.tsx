"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Stack,
  Title,
  Text,
  Group,
  Paper,
  SimpleGrid,
  ThemeIcon,
  Button,
  Tabs,
  TextInput,
  Textarea,
  Badge,
  Box,
  Image,
  Progress,
  ActionIcon,
  Tooltip,
  Center,
  Modal,
  Select,
  NumberInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBook,
  IconArticle,
  IconFileText,
  IconFlask,
  IconStar,
  IconClock,
  IconHeart,
  IconHeartFilled,
  IconEdit,
  IconTrash,
  IconPlus,
  IconQuote,
  IconNotes,
  IconTimelineEvent,
  IconArrowLeft,
  IconEye,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import type { ReadingItem, ReadingAnnotation, ReadingNote, ReadingSession } from "@/modules/reading";

// ─── Helpers ──────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  book: "Book", article: "Article", pdf: "PDF", research_paper: "Research Paper",
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  book: IconBook, article: IconArticle, pdf: IconFileText, research_paper: IconFlask,
};

const STATUS_LABELS: Record<string, string> = {
  want_to_read: "Want to Read", reading: "Reading", completed: "Completed",
  on_hold: "On Hold", dropped: "Dropped",
};

// ─── Props ────────────────────────────────────────────────────────

type Props = {
  item: ReadingItem;
  initialAnnotations: ReadingAnnotation[];
  initialNotes: ReadingNote[];
  initialSessions: ReadingSession[];
};

// ─── Add Annotation Modal ─────────────────────────────────────────

function AddAnnotationModal({
  opened,
  onClose,
  readingItemId,
  onCreated,
}: {
  opened: boolean;
  onClose: () => void;
  readingItemId: string;
  onCreated: (a: ReadingAnnotation) => void;
}) {
  const [type, setType] = useState<string>("highlight");
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [page, setPage] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reading/items/${readingItemId}/annotations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, text, note, page }),
      });
      if (res.ok) {
        const annotation = await res.json();
        onCreated(annotation);
        onClose();
        setText("");
        setNote("");
        setPage(undefined);
        notifications.show({ title: "Added", message: "Annotation saved", color: "green" });
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Add Annotation" size="md">
      <Stack gap="sm">
        <Select
          label="Type"
          value={type}
          onChange={(v) => setType(v ?? "highlight")}
          data={[
            { value: "highlight", label: "Highlight" },
            { value: "quote", label: "Quote" },
          ]}
        />
        <Textarea
          label={type === "quote" ? "Quote" : "Highlighted Text"}
          value={text}
          onChange={(e) => setText(e.currentTarget.value)}
          minRows={3}
          required
        />
        <Textarea
          label="Note"
          value={note}
          onChange={(e) => setNote(e.currentTarget.value)}
          minRows={2}
        />
        <NumberInput
          label="Page"
          value={page}
          onChange={(v) => setPage(typeof v === "string" ? parseInt(v, 10) : v)}
          min={0}
        />
        <Button onClick={handleSubmit} loading={loading} fullWidth>
          Save Annotation
        </Button>
      </Stack>
    </Modal>
  );
}

// ─── Add Session Modal ────────────────────────────────────────────

function AddSessionModal({
  opened,
  onClose,
  readingItemId,
  onCreated,
  item,
}: {
  opened: boolean;
  onClose: () => void;
  readingItemId: string;
  onCreated: (s: ReadingSession) => void;
  item: ReadingItem;
}) {
  const [pagesRead, setPagesRead] = useState<number | undefined>();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const duration = 30;
  const now = new Date();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        startTime: new Date(now.getTime() - duration * 60000).toISOString(),
        endTime: now.toISOString(),
        pagesRead,
        note,
      };
      const res = await fetch(`/api/reading/items/${readingItemId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const session = await res.json();
        onCreated(session);
        onClose();
        setPagesRead(undefined);
        setNote("");
        notifications.show({ title: "Logged", message: "Reading session saved", color: "green" });
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Log Reading Session" size="md">
      <Stack gap="sm">
        <NumberInput
          label="Pages Read"
          value={pagesRead}
          onChange={(v) => setPagesRead(typeof v === "string" ? parseInt(v, 10) : v)}
          min={0}
          max={item.pageCount ?? undefined}
        />
        <Textarea
          label="Note"
          value={note}
          onChange={(e) => setNote(e.currentTarget.value)}
          minRows={2}
        />
        <Text size="xs" c="dimmed">Session time: {dayjs(now).format("h:mm A")} (30 min)</Text>
        <Button onClick={handleSubmit} loading={loading} fullWidth>
          Log Session
        </Button>
      </Stack>
    </Modal>
  );
}

// ─── Add Note Modal ───────────────────────────────────────────────

function AddNoteModal({
  opened,
  onClose,
  readingItemId,
  onCreated,
}: {
  opened: boolean;
  onClose: () => void;
  readingItemId: string;
  onCreated: (n: ReadingNote) => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reading/items/${readingItemId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (res.ok) {
        const note = await res.json();
        onCreated(note);
        onClose();
        setTitle("");
        setContent("");
        notifications.show({ title: "Added", message: "Note saved", color: "green" });
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Add Note" size="md">
      <Stack gap="sm">
        <TextInput label="Title" value={title} onChange={(e) => setTitle(e.currentTarget.value)} required />
        <Textarea label="Content" value={content} onChange={(e) => setContent(e.currentTarget.value)} minRows={4} />
        <Button onClick={handleSubmit} loading={loading} fullWidth>
          Save Note
        </Button>
      </Stack>
    </Modal>
  );
}

// ─── Main Detail Component ────────────────────────────────────────

export function ItemDetailContent({ item: initialItem, initialAnnotations, initialNotes, initialSessions }: Props) {
  const router = useRouter();
  const [item, setItem] = useState(initialItem);
  const [annotations, setAnnotations] = useState(initialAnnotations);
  const [notes, setNotes] = useState(initialNotes);
  const [sessions, setSessions] = useState(initialSessions);
  const [activeTab, setActiveTab] = useState<string | null>("overview");
  const [annotationOpened, { open: openAnnotation, close: closeAnnotation }] = useDisclosure(false);
  const [sessionOpened, { open: openSession, close: closeSession }] = useDisclosure(false);
  const [noteOpened, { open: openNote, close: closeNote }] = useDisclosure(false);

  const progress = item.pageCount && item.pageCount > 0
    ? Math.round(((item.currentPage ?? 0) / item.pageCount) * 100)
    : 0;

  const totalMinutes = sessions.reduce((sum, s) => {
    if (s.endTime) return sum + dayjs(s.endTime).diff(dayjs(s.startTime), "minute");
    return sum;
  }, 0);

  const Icon = TYPE_ICONS[item.type] ?? IconBook;

  const handleStatusChange = async (status: string) => {
    const res = await fetch(`/api/reading/items/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItem(updated);
      notifications.show({ title: "Updated", message: `Status changed to ${STATUS_LABELS[status]}`, color: "blue" });
    }
  };

  const handleToggleFavorite = async () => {
    const res = await fetch(`/api/reading/items/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorited: !item.isFavorited }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItem(updated);
    }
  };

  const handleDeleteAnnotation = async (id: string) => {
    const res = await fetch(`/api/reading/annotations/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAnnotations((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleDeleteNote = async (id: string) => {
    const res = await fetch(`/api/reading/notes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  };

  return (
    <>
      <Stack gap="md">
        {/* Back + Actions */}
        <Group justify="space-between">
          <Group gap="xs">
            <ActionIcon variant="subtle" onClick={() => router.push("/library")}>
              <IconArrowLeft size={18} />
            </ActionIcon>
            <Badge size="lg" variant="light" color="gray">
              {TYPE_LABELS[item.type]}
            </Badge>
          </Group>
          <Group gap="xs">
            <Select
              value={item.status}
              onChange={(v) => v && handleStatusChange(v)}
              data={[
                { value: "want_to_read", label: "Want to Read" },
                { value: "reading", label: "Reading" },
                { value: "completed", label: "Completed" },
                { value: "on_hold", label: "On Hold" },
                { value: "dropped", label: "Dropped" },
              ]}
              size="xs"
              style={{ minWidth: 130 }}
            />
            <ActionIcon variant="subtle" onClick={handleToggleFavorite}>
              {item.isFavorited ? <IconHeartFilled size={18} className="text-red-500" /> : <IconHeart size={18} />}
            </ActionIcon>
            <Button size="sm" variant="light" leftSection={<IconPlus size={14} />} onClick={openSession}>
              Log Session
            </Button>
          </Group>
        </Group>

        {/* Header */}
        <Paper p="lg" radius="md">
          <Group gap="lg" align="flex-start" wrap="nowrap">
            {item.coverUrl ? (
              <Image src={item.coverUrl} alt={item.title} w={120} h={180} radius="md" className="object-cover shrink-0" />
            ) : (
              <Center w={120} h={180} className="bg-gray-100 dark:bg-gray-800 rounded-md shrink-0">
                <ThemeIcon variant="light" size="xl" color="gray">
                  <Icon size={32} />
                </ThemeIcon>
              </Center>
            )}

            <Box style={{ flex: 1 }}>
              <Title order={2}>{item.title}</Title>
              {item.subtitle && <Text c="dimmed" size="sm">{item.subtitle}</Text>}
              {item.authors && item.authors.length > 0 && (
                <Text size="sm" mt={4}>{item.authors.join(", ")}</Text>
              )}

              <Group gap="xs" mt="sm">
                {item.publisher && <Badge variant="light">{item.publisher}</Badge>}
                {item.publishedYear && <Badge variant="outline">{item.publishedYear}</Badge>}
                {item.isbn && <Badge variant="outline">ISBN: {item.isbn}</Badge>}
                {item.language && <Badge variant="outline">{item.language.toUpperCase()}</Badge>}
              </Group>

              {item.tags && item.tags.length > 0 && (
                <Group gap={4} mt="sm">
                  {item.tags.map((tag) => (
                    <Badge key={tag} size="sm" variant="dot" color="gray">
                      {tag}
                    </Badge>
                  ))}
                </Group>
              )}
            </Box>
          </Group>
        </Paper>

        {/* Progress */}
        {item.pageCount && item.pageCount > 0 && (
          <Paper p="sm" radius="md">
            <Group gap="sm">
              <Box style={{ flex: 1 }}>
                <Group justify="space-between" mb={4}>
                  <Text size="sm" fw={500}>Progress</Text>
                  <Text size="sm" fw={500} className="tabular-nums">{progress}%</Text>
                </Group>
                <Progress value={progress} size="md" color={progress === 100 ? "green" : "blue"} />
                <Group justify="space-between" mt={4}>
                  <Text size="xs" c="dimmed">{item.currentPage ?? 0} / {item.pageCount} pages</Text>
                  <Text size="xs" c="dimmed">
                    {totalMinutes > 0 ? `${Math.round(totalMinutes)} min read` : ""}
                  </Text>
                </Group>
              </Box>
            </Group>
          </Paper>
        )}

        {/* Stats */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          <Paper p="sm" radius="md" className="text-center">
            <Text fw={700} size="xl" className="tabular-nums">{sessions.length}</Text>
            <Text size="xs" c="dimmed">Sessions</Text>
          </Paper>
          <Paper p="sm" radius="md" className="text-center">
            <Text fw={700} size="xl" className="tabular-nums">{Math.round(totalMinutes)}</Text>
            <Text size="xs" c="dimmed">Minutes</Text>
          </Paper>
          <Paper p="sm" radius="md" className="text-center">
            <Text fw={700} size="xl" className="tabular-nums">{annotations.length}</Text>
            <Text size="xs" c="dimmed">Annotations</Text>
          </Paper>
          <Paper p="sm" radius="md" className="text-center">
            <Text fw={700} size="xl" className="tabular-nums">{notes.length}</Text>
            <Text size="xs" c="dimmed">Notes</Text>
          </Paper>
        </SimpleGrid>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<IconEye size={14} />}>Overview</Tabs.Tab>
            <Tabs.Tab value="annotations" leftSection={<IconQuote size={14} />}>
              Annotations ({annotations.length})
            </Tabs.Tab>
            <Tabs.Tab value="notes" leftSection={<IconNotes size={14} />}>
              Notes ({notes.length})
            </Tabs.Tab>
            <Tabs.Tab value="sessions" leftSection={<IconTimelineEvent size={14} />}>
              Sessions ({sessions.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            {item.description && (
              <Paper p="md" radius="md">
                <Text fw={600} size="sm" mb="xs">Description</Text>
                <Text size="sm" c="dimmed">{item.description}</Text>
              </Paper>
            )}

            {item.review && (
              <Paper p="md" radius="md" mt="sm">
                <Text fw={600} size="sm" mb="xs">Review</Text>
                <Text size="sm" c="dimmed">{item.review}</Text>
              </Paper>
            )}

            {item.startDate && (
              <Paper p="md" radius="md" mt="sm">
                <Text fw={600} size="sm" mb="xs">Reading Timeline</Text>
                <Stack gap={4}>
                  <Text size="sm">Started: {dayjs(item.startDate).format("MMM D, YYYY")}</Text>
                  {item.endDate && <Text size="sm">Finished: {dayjs(item.endDate).format("MMM D, YYYY")}</Text>}
                </Stack>
              </Paper>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="annotations" pt="md">
            <Group justify="flex-end" mb="sm">
              <Button size="sm" variant="light" leftSection={<IconPlus size={14} />} onClick={openAnnotation}>
                Add Annotation
              </Button>
            </Group>

            {annotations.length === 0 ? (
              <Center py="xl">
                <Stack align="center" gap="sm">
                  <ThemeIcon size={50} radius="xl" variant="light" color="gray">
                    <IconQuote size={24} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed">No annotations yet.</Text>
                  <Button size="sm" variant="light" onClick={openAnnotation}>
                    Add your first annotation
                  </Button>
                </Stack>
              </Center>
            ) : (
              <Stack gap="xs">
                {annotations.map((a) => (
                  <Paper key={a.id} p="sm" radius="md" className="hover:shadow-sm transition-shadow">
                    <Group gap="sm" align="flex-start" wrap="nowrap">
                      <Box style={{ flex: 1 }}>
                        <Group gap={4} mb={2}>
                          <Badge size="xs" variant="light" color={a.type === "quote" ? "yellow" : "blue"}>
                            {a.type}
                          </Badge>
                          {a.page && <Badge size="xs" variant="outline">p.{a.page}</Badge>}
                        </Group>
                        <Text size="sm" fs="italic">"{a.text}"</Text>
                        {a.note && <Text size="xs" c="dimmed" mt={4}>{a.note}</Text>}
                      </Box>
                      <ActionIcon variant="subtle" size="sm" color="red" onClick={() => handleDeleteAnnotation(a.id)}>
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="notes" pt="md">
            <Group justify="flex-end" mb="sm">
              <Button size="sm" variant="light" leftSection={<IconPlus size={14} />} onClick={openNote}>
                Add Note
              </Button>
            </Group>

            {notes.length === 0 ? (
              <Center py="xl">
                <Stack align="center" gap="sm">
                  <ThemeIcon size={50} radius="xl" variant="light" color="gray">
                    <IconNotes size={24} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed">No notes yet.</Text>
                  <Button size="sm" variant="light" onClick={openNote}>
                    Add your first note
                  </Button>
                </Stack>
              </Center>
            ) : (
              <Stack gap="xs">
                {notes.map((n) => (
                  <Paper key={n.id} p="sm" radius="md" className="hover:shadow-sm transition-shadow">
                    <Group gap="sm" align="flex-start" wrap="nowrap">
                      <Box style={{ flex: 1 }}>
                        <Text fw={600} size="sm">{n.title}</Text>
                        {n.content && <Text size="xs" c="dimmed" mt={2} lineClamp={3}>{n.content}</Text>}
                        <Text size="xs" c="dimmed" mt={4}>{dayjs(n.createdAt).format("MMM D, YYYY h:mm A")}</Text>
                      </Box>
                      <ActionIcon variant="subtle" size="sm" color="red" onClick={() => handleDeleteNote(n.id)}>
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="sessions" pt="md">
            <Group justify="flex-end" mb="sm">
              <Button size="sm" variant="light" leftSection={<IconPlus size={14} />} onClick={openSession}>
                Log Session
              </Button>
            </Group>

            {sessions.length === 0 ? (
              <Center py="xl">
                <Stack align="center" gap="sm">
                  <ThemeIcon size={50} radius="xl" variant="light" color="gray">
                    <IconTimelineEvent size={24} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed">No reading sessions logged.</Text>
                  <Button size="sm" variant="light" onClick={openSession}>
                    Log your first session
                  </Button>
                </Stack>
              </Center>
            ) : (
              <Stack gap="xs">
                {sessions.map((s) => {
                  const mins = s.endTime
                    ? dayjs(s.endTime).diff(dayjs(s.startTime), "minute")
                    : 0;
                  return (
                    <Paper key={s.id} p="sm" radius="md" className="hover:shadow-sm transition-shadow">
                      <Group gap="sm" align="flex-start" wrap="nowrap">
                        <Box style={{ flex: 1 }}>
                          <Group gap={4} mb={2}>
                            <Badge size="xs" variant="light" color="blue">
                              {dayjs(s.startTime).format("MMM D, YYYY")}
                            </Badge>
                            <Badge size="xs" variant="outline">
                              {dayjs(s.startTime).format("h:mm A")}
                            </Badge>
                          </Group>
                          <Group gap="md">
                            {mins > 0 && <Text size="sm">{mins} min</Text>}
                            {s.pagesRead && <Text size="sm">{s.pagesRead} pages</Text>}
                          </Group>
                          {s.note && <Text size="xs" c="dimmed" mt={2}>{s.note}</Text>}
                        </Box>
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <AddAnnotationModal
        opened={annotationOpened}
        onClose={closeAnnotation}
        readingItemId={item.id}
        onCreated={(a) => setAnnotations((prev) => [a, ...prev])}
      />

      <AddSessionModal
        opened={sessionOpened}
        onClose={closeSession}
        readingItemId={item.id}
        onCreated={(s) => setSessions((prev) => [s, ...prev])}
        item={item}
      />

      <AddNoteModal
        opened={noteOpened}
        onClose={closeNote}
        readingItemId={item.id}
        onCreated={(n) => setNotes((prev) => [n, ...prev])}
      />
    </>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
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
  SegmentedControl,
  ActionIcon,
  Badge,
  Box,
  Card,
  Image,
  Progress,
  Menu,
  Modal,
  Skeleton,
  Center,
  Select,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBooks,
  IconArticle,
  IconFileText,
  IconFlask,
  IconPlus,
  IconSearch,
  IconLayoutGrid,
  IconList,
  IconLayoutKanban,
  IconStar,
  IconClock,
  IconBook,
  IconEye,
  IconHeart,
  IconHeartFilled,
  IconTrash,
  IconEdit,
  IconChevronRight,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { notifications } from "@mantine/notifications";
import type { ReadingItem } from "@/modules/reading";

// ─── Types ────────────────────────────────────────────────────────

type DashboardData = {
  totalBooks: number;
  totalArticles: number;
  totalPdfs: number;
  totalPapers: number;
  booksRead: number;
  pagesRead: number;
  hoursRead: number;
  totalQuotes: number;
  currentlyReading: ReadingItem[];
  currentlyReadingCount: number;
};

type ViewMode = "grid" | "list" | "compact";

// ─── Helpers ──────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  book: "Book",
  article: "Article",
  pdf: "PDF",
  research_paper: "Research Paper",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  book: <IconBook size={16} />,
  article: <IconArticle size={16} />,
  pdf: <IconFileText size={16} />,
  research_paper: <IconFlask size={16} />,
};

const STATUS_COLORS: Record<string, string> = {
  want_to_read: "gray",
  reading: "blue",
  completed: "green",
  on_hold: "orange",
  dropped: "red",
};

const STATUS_LABELS: Record<string, string> = {
  want_to_read: "Want to Read",
  reading: "Reading",
  completed: "Completed",
  on_hold: "On Hold",
  dropped: "Dropped",
};

// ─── Props ────────────────────────────────────────────────────────

type Props = {
  initialDashboard: DashboardData | null;
};

// ─── Dashboard ────────────────────────────────────────────────────

function DashboardHero({ dashboard, onAdd }: { dashboard: DashboardData; onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--mantine-color-text)] sm:text-4xl">
            Library
          </h1>
          <p className="mt-1 text-[var(--mantine-color-dimmed)]">
            {dashboard.currentlyReadingCount > 0
              ? `You have ${dashboard.currentlyReadingCount} item${dashboard.currentlyReadingCount > 1 ? "s" : ""} in progress.`
              : "Ready to start reading?"}
          </p>
        </div>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button leftSection={<IconPlus size={18} />}>
                Add New
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconBook size={16} />} onClick={onAdd}>
                Add Book
              </Menu.Item>
              <Menu.Item leftSection={<IconArticle size={16} />} onClick={onAdd}>
                Add Article
              </Menu.Item>
              <Menu.Item leftSection={<IconFileText size={16} />} onClick={onAdd}>
                Add PDF
              </Menu.Item>
              <Menu.Item leftSection={<IconFlask size={16} />} onClick={onAdd}>
                Add Research Paper
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
      </div>

      <SimpleGrid cols={{ base: 2, sm: 4, md: 8 }} spacing="sm">
        <StatCard icon={IconBooks} value={dashboard.totalBooks} label="Books" />
        <StatCard icon={IconArticle} value={dashboard.totalArticles} label="Articles" />
        <StatCard icon={IconFileText} value={dashboard.totalPdfs} label="PDFs" />
        <StatCard icon={IconFlask} value={dashboard.totalPapers} label="Papers" />
        <StatCard icon={IconStar} value={dashboard.booksRead} label="Read" />
        <StatCard icon={IconClock} value={`${dashboard.hoursRead}h`} label="Hours" />
        <StatCard icon={IconBook} value={dashboard.pagesRead} label="Pages" />
        <StatCard icon={IconEye} value={dashboard.totalQuotes} label="Quotes" />
      </SimpleGrid>
    </motion.div>
  );
}

function StatCard({ icon: Icon, value, label }: { icon: React.ElementType; value: string | number; label: string }) {
  return (
    <Paper withBorder p="xs" radius="md" className="text-center" bg="transparent">
      <ThemeIcon variant="light" size="md" radius="xl" className="mx-auto">
        <Icon size={16} />
      </ThemeIcon>
      <Text fw={700} size="lg" className="tabular-nums" mt={2}>
        {value}
      </Text>
      <Text size="xs" c="dimmed">{label}</Text>
    </Paper>
  );
}

// ─── Currently Reading ────────────────────────────────────────────

function CurrentlyReading({ items }: { items: ReadingItem[] }) {
  if (items.length === 0) return null;

  return (
    <Box>
      <Title order={4} mb="sm">Continue Reading</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
        {items.slice(0, 3).map((item) => (
          <Paper key={item.id} p="sm" radius="md" withBorder>
            <Group gap="sm" wrap="nowrap" align="flex-start">
              {item.coverUrl && (
                <Image
                  src={item.coverUrl}
                  alt={item.title}
                  w={48}
                  h={72}
                  radius="sm"
                  className="object-cover shrink-0"
                />
              )}
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text fw={600} size="sm" lineClamp={2}>{item.title}</Text>
                <Text size="xs" c="dimmed">{item.authors?.[0]}</Text>
                {item.pageCount && item.pageCount > 0 && (
                  <Group gap={4} mt={4}>
                    <Progress
                      value={((item.currentPage ?? 0) / item.pageCount) * 100}
                      size="xs"
                      style={{ flex: 1 }}
                      color="blue"
                    />
                    <Text size="xs" c="dimmed" className="tabular-nums">
                      {Math.round(((item.currentPage ?? 0) / item.pageCount) * 100)}%
                    </Text>
                  </Group>
                )}
              </Box>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>
    </Box>
  );
}

// ─── Item Card ─────────────────────────────────────────────────────

function ReadingCard({
  item,
  viewMode,
  onEdit,
  onDelete,
  onToggleFavorite,
}: {
  item: ReadingItem;
  viewMode: ViewMode;
  onEdit: (item: ReadingItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (item: ReadingItem) => void;
}) {
  const progress = item.pageCount && item.pageCount > 0
    ? Math.round(((item.currentPage ?? 0) / item.pageCount) * 100)
    : 0;

  if (viewMode === "compact") {
    return (
      <Group gap="sm" py={6} px="sm" className="hover:bg-[var(--mantine-color-dark-6)] rounded-md transition-colors">
        <Badge size="sm" color={STATUS_COLORS[item.status]} variant="dot" />
        <Text size="sm" fw={500} style={{ flex: 1 }} lineClamp={1}>{item.title}</Text>
        <Text size="xs" c="dimmed" className="tabular-nums">{item.authors?.[0]}</Text>
        {progress > 0 && <Text size="xs" c="dimmed" className="tabular-nums">{progress}%</Text>}
        <ActionIcon variant="subtle" size="sm" onClick={() => onToggleFavorite(item)}>
          {item.isFavorited ? <IconHeartFilled size={14} className="text-red-500" /> : <IconHeart size={14} />}
        </ActionIcon>
      </Group>
    );
  }

  if (viewMode === "list") {
    return (
      <Paper p="sm" radius="md" withBorder>
        <Group gap="sm" wrap="nowrap" align="flex-start">
          {item.coverUrl && (
            <Image src={item.coverUrl} alt={item.title} w={40} h={60} radius="sm" className="object-cover shrink-0" />
          )}
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group gap={4} mb={2}>
              <Badge size="xs" variant="light" color={STATUS_COLORS[item.status]}>
                {STATUS_LABELS[item.status]}
              </Badge>
              <Badge size="xs" variant="outline" color="gray">
                {TYPE_LABELS[item.type]}
              </Badge>
            </Group>
            <Text fw={600} size="sm" lineClamp={1}>{item.title}</Text>
            {item.authors && item.authors.length > 0 && (
              <Text size="xs" c="dimmed">{item.authors.join(", ")}</Text>
            )}
            {progress > 0 && (
              <Group gap={4} mt={4}>
                <Progress value={progress} size="xs" style={{ maxWidth: 200, flex: 1 }} color={progress === 100 ? "green" : "blue"} />
                <Text size="xs" c="dimmed" className="tabular-nums">{progress}%</Text>
              </Group>
            )}
          </Box>
          <Group gap={4}>
            <ActionIcon variant="subtle" size="sm" onClick={() => onToggleFavorite(item)}>
              {item.isFavorited ? <IconHeartFilled size={14} className="text-red-500" /> : <IconHeart size={14} />}
            </ActionIcon>
            <ActionIcon variant="subtle" size="sm" onClick={() => onEdit(item)}>
              <IconEdit size={14} />
            </ActionIcon>
            <ActionIcon variant="subtle" size="sm" color="red" onClick={() => onDelete(item.id)}>
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        </Group>
      </Paper>
    );
  }

  return (
    <Card padding="sm" radius="md" withBorder>
      <Card.Section>
        {item.coverUrl ? (
          <Image src={item.coverUrl} alt={item.title} h={180} className="object-cover" />
        ) : (
            <Center h={180} className="bg-[var(--mantine-color-dark-6)]">
            <ThemeIcon variant="light" size="xl" color="gray">
              {TYPE_ICONS[item.type] ?? <IconBook size={24} />}
            </ThemeIcon>
          </Center>
        )}
      </Card.Section>

      <Group gap={4} mt="xs">
        <Badge size="xs" variant="light" color={STATUS_COLORS[item.status]}>
          {STATUS_LABELS[item.status]}
        </Badge>
        <Badge size="xs" variant="outline" color="gray">
          {TYPE_LABELS[item.type]}
        </Badge>
      </Group>

      <Text fw={600} size="sm" lineClamp={2} mt={4}>
        {item.title}
      </Text>
      {item.authors && item.authors.length > 0 && (
        <Text size="xs" c="dimmed" lineClamp={1}>{item.authors.join(", ")}</Text>
      )}

      {progress > 0 && (
        <Group gap={4} mt={4}>
          <Progress value={progress} size="xs" style={{ flex: 1 }} color={progress === 100 ? "green" : "blue"} />
          <Text size="xs" c="dimmed" className="tabular-nums">{progress}%</Text>
        </Group>
      )}

      <Group gap={4} mt="xs" justify="flex-end">
        <ActionIcon variant="subtle" size="sm" onClick={() => onToggleFavorite(item)}>
          {item.isFavorited ? <IconHeartFilled size={14} className="text-red-500" /> : <IconHeart size={14} />}
        </ActionIcon>
        <ActionIcon variant="subtle" size="sm" onClick={() => onEdit(item)}>
          <IconEdit size={14} />
        </ActionIcon>
      </Group>
    </Card>
  );
}

// ─── Add Item Modal ───────────────────────────────────────────────

function AddItemModal({
  opened,
  onClose,
  onCreated,
}: {
  opened: boolean;
  onClose: () => void;
  onCreated: (item: ReadingItem) => void;
}) {
  const [type, setType] = useState<string>("book");
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [isbn, setIsbn] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<string>("want_to_read");
  const [tags, setTags] = useState("");
  const [pageCount, setPageCount] = useState("");
  const [loading, setLoading] = useState(false);
  type SearchResult = { title: string; authors: string[]; isbn: string; coverUrl?: string; pageCount?: number };
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!title.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/reading/openlibrary?title=${encodeURIComponent(title)}`);
      if (res.ok) setSearchResults(await res.json());
    } catch {} finally {
      setSearching(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        type,
        title,
        authors: authors ? authors.split(",").map((a: string) => a.trim()) : [],
        status,
        tags: tags ? tags.split(",").map((t: string) => t.trim()) : [],
      };
      if (isbn) body.isbn = isbn;
      if (url) body.url = url;
      if (pageCount) body.pageCount = parseInt(pageCount, 10);

      const res = await fetch("/api/reading/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const item = await res.json();
        onCreated(item);
        onClose();
        setTitle("");
        setAuthors("");
        setIsbn("");
        setUrl("");
        setTags("");
        setPageCount("");
        setSearchResults(null);
        notifications.show({ title: "Added", message: `${TYPE_LABELS[type]} added to library`, color: "green" });
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const selectSearchResult = (result: SearchResult) => {
    setTitle(result.title);
    setAuthors(result.authors.join(", "));
    if (result.isbn) setIsbn(result.isbn);
    if (result.pageCount) setPageCount(String(result.pageCount));
    setSearchResults(null);
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Add to Library" size="lg">
      <Stack gap="sm">
        <Select
          label="Type"
          value={type}
          onChange={(v) => setType(v ?? "book")}
          data={[
            { value: "book", label: "Book" },
            { value: "article", label: "Article" },
            { value: "pdf", label: "PDF" },
            { value: "research_paper", label: "Research Paper" },
          ]}
        />

        {type === "book" && (
          <>
            <Group gap="sm" align="flex-end">
              <TextInput
                label="Search ISBN or Title"
                placeholder="Search OpenLibrary..."
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                style={{ flex: 1 }}
              />
              <Button variant="light" size="sm" onClick={handleSearch} loading={searching}>
                Search
              </Button>
            </Group>

            {searchResults && searchResults.length > 0 && (
              <Paper p="xs" radius="md" className="border">
                <Stack gap={4}>
                  {searchResults.slice(0, 5).map((result, i) => (
                    <Group
                      key={i}
                      gap="sm"
                      py={4}
                      px="xs"
                      className="hover:bg-[var(--mantine-color-dark-6)] rounded cursor-pointer"
                      onClick={() => selectSearchResult(result)}
                    >
                      <Box style={{ flex: 1 }}>
                        <Text size="sm" fw={500}>{result.title}</Text>
                        <Text size="xs" c="dimmed">{result.authors?.join(", ")}</Text>
                      </Box>
                      <IconChevronRight size={14} className="text-gray-400" />
                    </Group>
                  ))}
                </Stack>
              </Paper>
            )}
          </>
        )}

        <TextInput
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
        />

        {type !== "article" && type !== "research_paper" && (
          <TextInput
            label="Authors (comma separated)"
            value={authors}
            onChange={(e) => setAuthors(e.currentTarget.value)}
          />
        )}

        {type === "article" && (
          <TextInput
            label="URL"
            value={url}
            onChange={(e) => setUrl(e.currentTarget.value)}
            placeholder="https://..."
          />
        )}

        {type === "book" && (
          <TextInput
            label="ISBN"
            value={isbn}
            onChange={(e) => setIsbn(e.currentTarget.value)}
          />
        )}

        {(type === "book" || type === "pdf") && (
          <TextInput
            label="Page Count"
            value={pageCount}
            onChange={(e) => setPageCount(e.currentTarget.value)}
            type="number"
          />
        )}

        <Select
          label="Status"
          value={status}
          onChange={(v) => setStatus(v ?? "want_to_read")}
          data={[
            { value: "want_to_read", label: "Want to Read" },
            { value: "reading", label: "Reading" },
            { value: "completed", label: "Completed" },
            { value: "on_hold", label: "On Hold" },
            { value: "dropped", label: "Dropped" },
          ]}
        />

        <TextInput
          label="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.currentTarget.value)}
        />

        <Button onClick={handleSubmit} loading={loading} fullWidth mt="sm">
          Add to Library
        </Button>
      </Stack>
    </Modal>
  );
}

// ─── Main Library Content ─────────────────────────────────────────

export function LibraryContent({ initialDashboard }: Props) {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [items, setItems] = useState<ReadingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);

  const TAB_MAP: Record<string, { type?: string; label: string; icon: React.ReactNode }> = {
    all: { label: "All", icon: <IconBooks size={14} /> },
    book: { type: "book", label: "Books", icon: <IconBook size={14} /> },
    article: { type: "article", label: "Articles", icon: <IconArticle size={14} /> },
    pdf: { type: "pdf", label: "PDFs", icon: <IconFileText size={14} /> },
    research_paper: { type: "research_paper", label: "Research", icon: <IconFlask size={14} /> },
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const tab = TAB_MAP[activeTab ?? "all"];
      if (tab?.type) params.set("type", tab.type);
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      params.set("sortBy", sortBy);
      params.set("limit", "100");

      const res = await fetch(`/api/reading/items?${params}`);
      if (res.ok) setItems(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }, [activeTab, search, statusFilter, sortBy]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreated = (item: ReadingItem) => {
    setItems((prev) => [item, ...prev]);
    if (dashboard) {
      setDashboard({
        ...dashboard,
        currentlyReading: item.status === "reading" ? [item, ...dashboard.currentlyReading] : dashboard.currentlyReading,
        currentlyReadingCount: item.status === "reading" ? dashboard.currentlyReadingCount + 1 : dashboard.currentlyReadingCount,
        totalBooks: item.type === "book" ? dashboard.totalBooks + 1 : dashboard.totalBooks,
        totalArticles: item.type === "article" ? dashboard.totalArticles + 1 : dashboard.totalArticles,
        totalPdfs: item.type === "pdf" ? dashboard.totalPdfs + 1 : dashboard.totalPdfs,
        totalPapers: item.type === "research_paper" ? dashboard.totalPapers + 1 : dashboard.totalPapers,
      });
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/reading/items/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      notifications.show({ title: "Deleted", message: "Item removed from library", color: "red" });
    }
  };

  const handleToggleFavorite = async (item: ReadingItem) => {
    const res = await fetch(`/api/reading/items/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorited: !item.isFavorited }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isFavorited: !i.isFavorited } : i)));
    }
  };

  const handleEdit = (item: ReadingItem) => {
    // For v1, inline status change dropdown on the card
    // Full edit in modal later
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Stack gap="md">
        {dashboard && (
          <>
            <DashboardHero dashboard={dashboard} onAdd={openAdd} />
            <CurrentlyReading items={dashboard.currentlyReading} />
          </>
        )}

        {/* Library Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            {Object.entries(TAB_MAP).map(([key, tab]) => (
              <Tabs.Tab key={key} value={key} leftSection={tab.icon}>
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {/* Filters Bar */}
          <Group gap="sm" mt="md" mb="sm" wrap="nowrap">
            <TextInput
              placeholder="Search library..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ flex: 1 }}
              size="sm"
            />
            <Select
              placeholder="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              data={[
                { value: "", label: "All Status" },
                { value: "want_to_read", label: "Want to Read" },
                { value: "reading", label: "Reading" },
                { value: "completed", label: "Completed" },
                { value: "on_hold", label: "On Hold" },
                { value: "dropped", label: "Dropped" },
              ]}
              clearable
              size="sm"
              style={{ minWidth: 140 }}
            />
            <Select
              placeholder="Sort"
              value={sortBy}
              onChange={(v) => setSortBy(v ?? "createdAt")}
              data={[
                { value: "createdAt", label: "Date Added" },
                { value: "title", label: "Title" },
                { value: "rating", label: "Rating" },
                { value: "lastOpenedAt", label: "Last Opened" },
              ]}
              size="sm"
              style={{ minWidth: 130 }}
            />
            <SegmentedControl
              value={viewMode}
              onChange={(v) => setViewMode(v as ViewMode)}
              data={[
                { value: "grid", label: <IconLayoutGrid size={16} /> },
                { value: "list", label: <IconList size={16} /> },
                { value: "compact", label: <IconLayoutKanban size={16} /> },
              ]}
              size="sm"
            />
          </Group>

          {/* Items */}
          {Object.keys(TAB_MAP).map((key) => (
            <Tabs.Panel key={key} value={key} pt="xs">
              {loading ? (
                <SimpleGrid cols={{ base: 1, sm: 2, md: viewMode === "grid" ? 3 : 1 }} spacing="sm">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} height={viewMode === "grid" ? 280 : 72} radius="md" />
                  ))}
                </SimpleGrid>
              ) : items.length === 0 ? (
                <Center py="xl">
                  <Stack align="center" gap="sm">
                    <ThemeIcon size={60} radius="xl" variant="light" color="gray">
                      <IconBooks size={30} />
                    </ThemeIcon>
                    <Text size="sm" c="dimmed">No items yet.</Text>
                    <Button size="sm" variant="light" onClick={openAdd}>
                      Add your first item
                    </Button>
                  </Stack>
                </Center>
              ) : viewMode === "grid" ? (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                  {items.map((item) => (
                    <ReadingCard
                      key={item.id}
                      item={item}
                      viewMode={viewMode}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Stack gap="xs">
                  {items.map((item) => (
                    <ReadingCard
                      key={item.id}
                      item={item}
                      viewMode={viewMode}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </Stack>
              )}
            </Tabs.Panel>
          ))}
        </Tabs>
      </Stack>

      <AddItemModal opened={addOpened} onClose={closeAdd} onCreated={handleCreated} />
    </div>
  );
}

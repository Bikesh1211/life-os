"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card, Text, Group, Stack, SimpleGrid, Title, Button, TextInput, Select,
  Badge, ActionIcon, Menu, Skeleton, Center,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus, IconSearch, IconEdit, IconTrash, IconHeart, IconHeartFilled,
  IconDotsVertical, IconDeviceLaptop, IconUsers, IconTool,
} from "@tabler/icons-react";
import ItemFormModal from "../_components/ItemFormModal";
import { TECH_CATEGORIES, CONDITIONS, OWNERSHIP_STATUSES } from "@/modules/tech-gear/constants";

function ItemCard({ item, onEdit, onDelete, onToggleFavorite }: { item: any; onEdit: () => void; onDelete: () => void; onToggleFavorite: () => void }) {
  return (
    <Card shadow="sm" padding="md" radius="md" withBorder
      styles={{ root: { transition: "transform 0.2s", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" } } }}>
      <Stack gap="xs">
        <Group justify="space-between">
          <Group gap={6}>
            <IconDeviceLaptop size={18} color="var(--mantine-color-cyan-6)" />
            <Text fw={600} size="sm" lineClamp={1}>{item.name}</Text>
          </Group>
          <ActionIcon variant="subtle" color={item.isFavorite ? "red" : "gray"} onClick={onToggleFavorite}>
            {item.isFavorite ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}
          </ActionIcon>
        </Group>
        <Group gap={4}>
          <Badge size="sm" variant="light" tt="capitalize">{item.category?.replace("-", " ")}</Badge>
          {item.ownershipStatus !== "owned" && (
            <Badge size="sm" color={item.ownershipStatus === "loaned-out" ? "orange" : item.ownershipStatus === "sold" ? "gray" : "red"} tt="capitalize">{item.ownershipStatus}</Badge>
          )}
          {(item.condition === "broken" || item.condition === "repairing") && (
            <IconTool size={14} color="var(--mantine-color-red-6)" />
          )}
        </Group>
        <Group gap="xs">
          {item.brand && <Text size="xs" c="dimmed">{item.brand}</Text>}
          {item.model && <Text size="xs" c="dimmed">{item.model}</Text>}
        </Group>
        <Group justify="space-between">
          <Menu withinPortal position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" size="sm"><IconDotsVertical size={14} /></ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconEdit size={14} />} onClick={onEdit}>Edit</Menu.Item>
              <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={onDelete}>Delete</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Stack>
    </Card>
  );
}

export default function TechGearItemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [editItem, setEditItem] = useState<any>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryFilter) params.set("category", categoryFilter);
    try {
      const res = await fetch(`/api/inventory/tech-gear/items?${params}`);
      const data = await res.json();
      setItems(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, categoryFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { if (searchParams.get("add") === "true") { setEditItem(null); open(); } }, [searchParams]);

  const handleSave = async (data: any) => {
    if (editItem) {
      await fetch(`/api/inventory/tech-gear/items/${editItem.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    } else {
      await fetch("/api/inventory/tech-gear/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    }
    fetchItems(); setEditItem(null);
  };

  const handleDelete = async (id: string) => { await fetch(`/api/inventory/tech-gear/items/${id}`, { method: "DELETE" }); fetchItems(); };
  const handleToggleFavorite = async (item: any) => {
    await fetch(`/api/inventory/tech-gear/items/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isFavorite: !item.isFavorite }) });
    fetchItems();
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>Tech Items ({items.length})</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => { setEditItem(null); open(); }}>Add Item</Button>
      </Group>
      <Group gap="sm" wrap="wrap">
        <TextInput placeholder="Search items..." leftSection={<IconSearch size={16} />}
          value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
        <Select placeholder="Category" data={TECH_CATEGORIES.map(c => ({ value: c, label: c.replace("-", " ") }))}
          value={categoryFilter} onChange={setCategoryFilter} clearable searchable style={{ width: 180 }} />
      </Group>

      {loading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }}>{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} height={160} radius="md" />)}</SimpleGrid>
      ) : items.length === 0 ? (
        <Center h={300}>
          <Stack align="center" gap="md">
            <IconDeviceLaptop size={48} color="var(--mantine-color-gray-5)" />
            <Text c="dimmed">No items found</Text>
            <Button variant="light" leftSection={<IconPlus size={16} />} onClick={() => { setEditItem(null); open(); }}>Add Your First Item</Button>
          </Stack>
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }}>
          {items.map(item => (
            <ItemCard key={item.id} item={item}
              onEdit={() => { setEditItem(item); open(); }}
              onDelete={() => handleDelete(item.id)}
              onToggleFavorite={() => handleToggleFavorite(item)} />
          ))}
        </SimpleGrid>
      )}
      <ItemFormModal opened={opened} onClose={() => { close(); setEditItem(null); }} onSave={handleSave} item={editItem} />
    </Stack>
  );
}

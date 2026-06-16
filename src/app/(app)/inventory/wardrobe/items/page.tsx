"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card, Text, Group, Stack, SimpleGrid, Title, Button, TextInput, Select,
  Badge, ActionIcon, Menu, Skeleton, Center, SegmentedControl, Chip,
  Modal, Switch, NumberInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus, IconSearch, IconFilter, IconEdit, IconTrash, IconHeart,
  IconHeartFilled, IconDotsVertical, IconShirt, IconEye,
} from "@tabler/icons-react";
import ItemFormModal from "../_components/ItemFormModal";
import {
  CLOTHING_CATEGORIES, CONDITIONS, SEASONS, ITEM_SORT_OPTIONS,
} from "@/modules/wardrobe/constants";

function ItemCard({ item, onEdit, onDelete, onToggleFavorite }: { item: any; onEdit: () => void; onDelete: () => void; onToggleFavorite: () => void }) {
  return (
    <Card shadow="sm" padding="md" radius="md" withBorder style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
      styles={{ root: { "&:hover": { transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" } } }}>
      <Stack gap="xs">
        <Group justify="space-between">
          <Group gap={6}>
            <IconShirt size={18} color="var(--mantine-color-blue-6)" />
            <Text fw={600} size="sm" lineClamp={1}>{item.name}</Text>
          </Group>
          <ActionIcon variant="subtle" color={item.isFavorite ? "red" : "gray"} onClick={onToggleFavorite}>
            {item.isFavorite ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}
          </ActionIcon>
        </Group>

        <Group gap={4}>
          <Badge size="sm" variant="light" tt="capitalize">{item.category}</Badge>
          {item.subcategory && <Badge size="sm" variant="outline" tt="capitalize">{item.subcategory}</Badge>}
        </Group>

        <Group gap="xs">
          {item.brand && <Text size="xs" c="dimmed">{item.brand}</Text>}
          {item.color && (
            <Group gap={4}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: item.color }} />
              <Text size="xs" c="dimmed" tt="capitalize">{item.color}</Text>
            </Group>
          )}
        </Group>

        <Group justify="space-between">
          <Group gap={4}>
            <Text size="xs" c="dimmed">{item.wearCount} wears</Text>
            {item.condition && (
              <Badge size="xs" color={item.condition === "new" ? "teal" : item.condition === "excellent" ? "green" : item.condition === "good" ? "blue" : item.condition === "fair" ? "yellow" : "red"}>
                {item.condition}
              </Badge>
            )}
          </Group>
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

export default function WardrobeItemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<string | null>("newest");
  const [opened, { open, close }] = useDisclosure(false);
  const [editItem, setEditItem] = useState<any>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryFilter) params.set("category", categoryFilter);
    if (sort) params.set("sort", sort);
    try {
      const res = await fetch(`/api/inventory/wardrobe/items?${params}`);
      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, sort]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setEditItem(null);
      open();
    }
  }, [searchParams]);

  const handleSave = async (data: any) => {
    if (editItem) {
      await fetch(`/api/inventory/wardrobe/items/${editItem.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/inventory/wardrobe/items", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
    }
    fetchItems();
    setEditItem(null);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/inventory/wardrobe/items/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const handleToggleFavorite = async (item: any) => {
    await fetch(`/api/inventory/wardrobe/items/${item.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isFavorite: !item.isFavorite }),
    });
    fetchItems();
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>My Wardrobe ({items.length})</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => { setEditItem(null); open(); }}>Add Item</Button>
      </Group>

      <Group gap="sm" wrap="wrap">
        <TextInput placeholder="Search items..." leftSection={<IconSearch size={16} />}
          value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
        <Select placeholder="Category" data={CLOTHING_CATEGORIES.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
          value={categoryFilter} onChange={setCategoryFilter} clearable searchable style={{ width: 160 }} />
        <Select placeholder="Sort" data={ITEM_SORT_OPTIONS.map(s => ({ value: s, label: s.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") }))}
          value={sort} onChange={setSort} style={{ width: 160 }} />
      </Group>

      {loading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }}>
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} height={180} radius="md" />)}
        </SimpleGrid>
      ) : items.length === 0 ? (
        <Center h={300}>
          <Stack align="center" gap="md">
            <IconShirt size={48} color="var(--mantine-color-gray-5)" />
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

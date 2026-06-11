"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card, Text, Group, Stack, SimpleGrid, Badge, Title, Button, Skeleton,
  Center, ActionIcon, Menu, Divider, Timeline,
} from "@mantine/core";
import {
  IconArrowLeft, IconEdit, IconTrash, IconHeart, IconHeartFilled,
  IconShirt, IconCalendar, IconCurrencyDollar, IconTag, IconWash, IconEye,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import ItemFormModal from "../../_components/ItemFormModal";

export default function ItemDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);

  const fetchItem = async () => {
    try {
      const res = await fetch(`/api/inventory/wardrobe/items/${params.id}`);
      const data = await res.json();
      setItem(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItem(); }, [params.id]);

  const handleSave = async (data: any) => {
    await fetch(`/api/inventory/wardrobe/items/${params.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    fetchItem();
  };

  const handleDelete = async () => {
    await fetch(`/api/inventory/wardrobe/items/${params.id}`, { method: "DELETE" });
    router.push("/inventory/wardrobe/items");
  };

  if (loading) return <Skeleton height={400} radius="md" />;
  if (!item) return <Center h={400}><Text c="dimmed">Item not found</Text></Center>;

  return (
    <Stack gap="md">
      <Group>
        <ActionIcon variant="subtle" onClick={() => router.back()}><IconArrowLeft size={20} /></ActionIcon>
        <Title order={3} style={{ flex: 1 }}>{item.name}</Title>
        <Group gap="xs">
          <Button variant="light" leftSection={<IconEdit size={16} />} onClick={open}>Edit</Button>
          <Button variant="light" color="red" leftSection={<IconTrash size={16} />} onClick={handleDelete}>Delete</Button>
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 3 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group gap="xs">
              <IconShirt size={20} />
              <Text fw={600}>Details</Text>
              {item.isFavorite && <IconHeartFilled size={16} color="var(--mantine-color-red-6)" />}
            </Group>
            <Group gap="xs">
              <Badge size="lg" variant="light" tt="capitalize">{item.category}</Badge>
              {item.subcategory && <Badge size="lg" variant="outline" tt="capitalize">{item.subcategory}</Badge>}
            </Group>
            {item.brand && <Text size="sm"><Text span fw={600} c="dimmed">Brand:</Text> {item.brand}</Text>}
            {item.color && (
              <Group gap={6}>
                <Text size="sm" fw={600} c="dimmed">Color:</Text>
                <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: item.color, border: "1px solid #ddd" }} />
                <Text size="sm" tt="capitalize">{item.color}</Text>
              </Group>
            )}
            {item.size && <Text size="sm"><Text span fw={600} c="dimmed">Size:</Text> {item.size.toUpperCase()}</Text>}
            {item.material && <Text size="sm"><Text span fw={600} c="dimmed">Material:</Text> {item.material}</Text>}
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group gap="xs">
              <IconTag size={20} />
              <Text fw={600}>Status</Text>
            </Group>
            <Group gap="xs">
              <Badge color={item.condition === "new" ? "teal" : item.condition === "excellent" ? "green" : item.condition === "good" ? "blue" : item.condition === "fair" ? "yellow" : "red"} tt="capitalize">{item.condition}</Badge>
              <Badge color={item.season === "all-season" ? "gray" : "blue"} tt="capitalize">{item.season}</Badge>
            </Group>
            <Group gap="xs">
              <IconWash size={16} />
              <Text size="sm"><Text span fw={600} c="dimmed">Laundry:</Text> {item.laundryStatus}</Text>
            </Group>
            <Text size="sm"><Text span fw={600} c="dimmed">Worn:</Text> {item.wearCount} times</Text>
            {item.lastWorn && <Text size="sm"><Text span fw={600} c="dimmed">Last worn:</Text> {new Date(item.lastWorn).toLocaleDateString()}</Text>}
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group gap="xs">
              <IconCurrencyDollar size={20} />
              <Text fw={600}>Value</Text>
            </Group>
            {item.purchasePrice && (
              <Text size="sm"><Text span fw={600} c="dimmed">Purchase price:</Text> ${parseFloat(item.purchasePrice).toFixed(2)}</Text>
            )}
            {item.currentValue && (
              <Text size="sm"><Text span fw={600} c="dimmed">Current value:</Text> ${parseFloat(item.currentValue).toFixed(2)}</Text>
            )}
            {item.purchaseDate && (
              <Text size="sm"><Text span fw={600} c="dimmed">Purchase date:</Text> {new Date(item.purchaseDate).toLocaleDateString()}</Text>
            )}
          </Stack>
        </Card>
      </SimpleGrid>

      {item.description && (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={600} mb="xs">Description</Text>
          <Text size="sm">{item.description}</Text>
        </Card>
      )}

      {item.notes && (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={600} mb="xs">Notes</Text>
          <Text size="sm">{item.notes}</Text>
        </Card>
      )}

      <ItemFormModal opened={opened} onClose={close} onSave={handleSave} item={item} />
    </Stack>
  );
}

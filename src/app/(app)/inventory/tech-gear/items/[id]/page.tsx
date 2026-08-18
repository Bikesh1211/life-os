"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card, Text, Group, Stack, SimpleGrid, Badge, Title, Button, Skeleton,
  Center, ActionIcon, Divider,
} from "@mantine/core";
import {
  IconArrowLeft, IconEdit, IconTrash, IconHeart, IconHeartFilled,
  IconDeviceLaptop, IconCalendar, IconCurrencyDollar, IconShieldCheck,
  IconUsers, IconMapPin, IconPalette,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import ItemFormModal from "../../_components/ItemFormModal";
import { apiFetch } from "@/core/api/http";
import type { TechItem } from "@/modules/tech-gear";

export default function TechItemDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);

  const fetchItem = async () => {
    try {
      const data = await apiFetch<TechItem>(`/api/inventory/tech-gear/items/${params.id}`);
      setItem(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItem(); }, [params.id]);

  const handleSave = async (data: any) => {
    await apiFetch(`/api/inventory/tech-gear/items/${params.id}`, { method: "PATCH", body: JSON.stringify(data) });
    fetchItem();
  };

  const handleDelete = async () => {
    await apiFetch(`/api/inventory/tech-gear/items/${params.id}`, { method: "DELETE" });
    router.push("/inventory/tech-gear/items");
  };

  if (loading) return <Skeleton height={400} radius="md" />;
  if (!item) return <Center h={400}><Text c="dimmed">Item not found</Text></Center>;

  const specs: [string, string][] = item.specifications ? Object.entries(item.specifications) : [];

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
            <Group gap="xs"><IconDeviceLaptop size={20} /><Text fw={600}>Details</Text>{item.isFavorite && <IconHeartFilled size={16} color="red" />}</Group>
            <Group gap="xs">
              <Badge size="lg" variant="light" tt="capitalize">{item.category?.replace("-", " ")}</Badge>
              <Badge size="lg" color={item.condition === "new" ? "teal" : item.condition === "excellent" ? "green" : item.condition === "good" ? "blue" : item.condition === "fair" ? "yellow" : "red"} tt="capitalize">{item.condition}</Badge>
              <Badge size="lg" color={item.ownershipStatus === "owned" ? "blue" : item.ownershipStatus === "loaned-out" ? "orange" : "gray"} tt="capitalize">{item.ownershipStatus?.replace("-", " ")}</Badge>
            </Group>
            {item.brand && <Text size="sm"><Text span fw={600} c="dimmed">Brand:</Text> {item.brand}</Text>}
            {item.model && <Text size="sm"><Text span fw={600} c="dimmed">Model:</Text> {item.model}</Text>}
            {item.serialNumber && <Text size="sm"><Text span fw={600} c="dimmed">S/N:</Text> {item.serialNumber}</Text>}
            {item.color && <Group gap={6}><Text size="sm" fw={600} c="dimmed">Color:</Text><Text size="sm">{item.color}</Text></Group>}
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group gap="xs"><IconShieldCheck size={20} /><Text fw={600}>Warranty & Location</Text></Group>
            {item.warrantyExpiry && <Text size="sm"><Text span fw={600} c="dimmed">Warranty until:</Text> {new Date(item.warrantyExpiry).toLocaleDateString()}</Text>}
            {item.warrantyProvider && <Text size="sm"><Text span fw={600} c="dimmed">Provider:</Text> {item.warrantyProvider}</Text>}
            {item.location && <Text size="sm"><IconMapPin size={14} /> {item.location}</Text>}
            {item.ownershipStatus === "loaned-out" && (
              <>
                <Divider />
                <Text size="sm"><Text span fw={600} c="dimmed">Loaned to:</Text> {item.loanedTo}</Text>
                {item.expectedReturnDate && <Text size="sm"><Text span fw={600} c="dimmed">Due back:</Text> {new Date(item.expectedReturnDate).toLocaleDateString()}</Text>}
              </>
            )}
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group gap="xs"><IconCurrencyDollar size={20} /><Text fw={600}>Purchase Info</Text></Group>
            {item.purchasePrice && <Text size="sm"><Text span fw={600} c="dimmed">Price:</Text> ${parseFloat(item.purchasePrice).toFixed(2)}</Text>}
            {item.purchaseDate && <Text size="sm"><Text span fw={600} c="dimmed">Purchased:</Text> {new Date(item.purchaseDate).toLocaleDateString()}</Text>}
          </Stack>
        </Card>
      </SimpleGrid>

      {specs.length > 0 && (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={600} mb="xs">Specifications</Text>
          <SimpleGrid cols={{ base: 2, md: 3 }}>
            {specs.map(([key, val]) => (
              <Group key={key} gap="xs">
                <Text size="sm" fw={500} c="dimmed" tt="capitalize">{key.replace(/_/g, " ")}:</Text>
                <Text size="sm">{val}</Text>
              </Group>
            ))}
          </SimpleGrid>
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

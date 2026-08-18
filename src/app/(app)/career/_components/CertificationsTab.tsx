"use client";

import { useEffect, useState } from "react";
import {
  Paper,
  Text,
  Title,
  Button,
  Stack,
  Group,
  Skeleton,
  Modal,
  TextInput,
  Card,
  Badge,
  Notification,
  Menu,
  ActionIcon,
  SimpleGrid,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconDots, IconTrash, IconCertificate, IconBuilding, IconCalendar } from "@tabler/icons-react";
import { apiFetch } from "@/core/api/http";

interface Certification {
  id: string;
  name: string;
  organization: string;
  credentialId: string | null;
  issueDate: string;
  expiryDate: string | null;
  verificationUrl: string | null;
  status: string;
  skillsCovered: string[];
}

export default function CertificationsTab() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    organization: "",
    credentialId: "",
    issueDate: "",
    expiryDate: "" as string | null,
    verificationUrl: "",
    skillsCovered: "",
  });

  const loadCerts = () => {
    setLoading(true);
    apiFetch<Certification[]>("/api/career/certifications")
      .then((d) => {
        setCerts(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(loadCerts, []);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.organization.trim() || !form.issueDate) return;
    try {
      const res = await fetch("/api/career/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          expiryDate: form.expiryDate || null,
          skillsCovered: form.skillsCovered ? form.skillsCovered.split(",").map((s) => s.trim()) : [],
        }),
      });
      if (!res.ok) throw new Error("Failed to create");
      setForm({ name: "", organization: "", credentialId: "", issueDate: "", expiryDate: null, verificationUrl: "", skillsCovered: "" });
      close();
      loadCerts();
    } catch {
      setError("Failed to create certification");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/career/certifications/${id}`, { method: "DELETE" });
      loadCerts();
    } catch {
      setError("Failed to delete");
    }
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const diff = new Date(expiryDate).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  };

  if (loading) {
    return (
      <Stack gap="md">
        <Skeleton height={120} />
        <Skeleton height={120} />
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>Certifications</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Add Certification
        </Button>
      </Group>

      {error && (
        <Notification color="red" onClose={() => setError(null)}>
          {error}
        </Notification>
      )}

      {certs.length === 0 ? (
        <Paper withBorder p="xl" radius="md" ta="center">
          <Text c="dimmed" size="lg">
            No certifications yet
          </Text>
          <Text c="dimmed" size="sm" mt="xs">
            Add your professional certifications
          </Text>
          <Button leftSection={<IconPlus size={16} />} mt="md" onClick={open}>
            Add Certification
          </Button>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          {certs.map((cert) => (
            <Card key={cert.id} withBorder padding="md" radius="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap={0}>
                  <Group gap="xs">
                    <IconCertificate size={18} />
                    <Text fw={600}>{cert.name}</Text>
                  </Group>
                  <Group gap={4} mt={4}>
                    <IconBuilding size={14} />
                    <Text size="sm" c="dimmed">
                      {cert.organization}
                    </Text>
                  </Group>
                  {cert.credentialId && (
                    <Text size="xs" c="dimmed" mt={2}>
                      ID: {cert.credentialId}
                    </Text>
                  )}
                  <Group gap="xs" mt={4}>
                    <Badge size="sm" variant="light" color="green">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </Badge>
                    {cert.expiryDate && (
                      <Badge size="sm" variant="light" color={isExpiringSoon(cert.expiryDate) ? "orange" : "gray"}>
                        Expires {new Date(cert.expiryDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </Group>
                  {cert.skillsCovered.length > 0 && (
                    <Group gap={4} mt={4}>
                      {cert.skillsCovered.map((skill) => (
                        <Badge key={skill} size="xs" variant="dot">
                          {skill}
                        </Badge>
                      ))}
                    </Group>
                  )}
                </Stack>
                <Menu withinPortal>
                  <Menu.Target>
                    <ActionIcon variant="subtle">
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={() => handleDelete(cert.id)}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Modal opened={opened} onClose={close} title="Add Certification" centered size="lg">
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="Certification Name"
              placeholder="e.g. AWS Solutions Architect"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              data-autofocus
              required
            />
            <TextInput
              label="Organization"
              placeholder="e.g. Amazon Web Services"
              value={form.organization}
              onChange={(e) => setForm({ ...form, organization: e.target.value })}
              required
            />
          </Group>
          <Group grow>
            <TextInput
              label="Credential ID"
              placeholder="e.g. AWS-12345"
              value={form.credentialId}
              onChange={(e) => setForm({ ...form, credentialId: e.target.value })}
            />
            <TextInput
              label="Skills Covered"
              placeholder="aws, cloud, architecture (comma-separated)"
              value={form.skillsCovered}
              onChange={(e) => setForm({ ...form, skillsCovered: e.target.value })}
            />
          </Group>
          <Group grow>
            <TextInput
              label="Issue Date"
              type="date"
              value={form.issueDate}
              onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
              required
            />
            <TextInput
              label="Expiry Date"
              type="date"
              value={form.expiryDate ?? ""}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value || null })}
            />
          </Group>
          <TextInput
            label="Verification URL"
            placeholder="https://www.credly.com/badges/..."
            value={form.verificationUrl}
            onChange={(e) => setForm({ ...form, verificationUrl: e.target.value })}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={close}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Add</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Modal, TextInput, Textarea, Group, Button, Stack, Switch, Text, MultiSelect, ActionIcon, CloseButton, Badge, SimpleGrid } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";

type ConnectionData = {
  id: string;
  name: string;
  nickname: string | null;
  gender: string | null;
  birthday: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  country: string | null;
  city: string | null;
  occupation: string | null;
  socialLinks: string[];
  relationshipTypes: string[];
  isFavorite: boolean;
  notes: string | null;
  firstMetDate: string | null;
  friendshipAnniversary: string | null;
  lastMetDate: string | null;
  lastCallDate: string | null;
  lastMessageDate: string | null;
};

type Props = {
  opened: boolean;
  onClose: () => void;
  initialData?: ConnectionData | null;
};

export function ConnectionsModal({ opened, onClose, initialData }: Props) {
  const isEditing = !!initialData;
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [occupation, setOccupation] = useState("");
  const [socialLinks, setSocialLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("");
  const [relationshipTypes, setRelationshipTypes] = useState<string[]>([]);
  const [newRelation, setNewRelation] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [notes, setNotes] = useState("");
  const [firstMetDate, setFirstMetDate] = useState("");
  const [friendshipAnniversary, setFriendshipAnniversary] = useState("");
  const [lastMetDate, setLastMetDate] = useState("");
  const [lastCallDate, setLastCallDate] = useState("");
  const [lastMessageDate, setLastMessageDate] = useState("");

  useEffect(() => {
    if (!opened) return;
    if (initialData) {
      setName(initialData.name ?? "");
      setNickname(initialData.nickname ?? "");
      setGender(initialData.gender ?? "");
      setBirthday(initialData.birthday ?? "");
      setPhone(initialData.phone ?? "");
      setEmail(initialData.email ?? "");
      setAddress(initialData.address ?? "");
      setCountry(initialData.country ?? "");
      setCity(initialData.city ?? "");
      setOccupation(initialData.occupation ?? "");
      setSocialLinks(initialData.socialLinks ?? []);
      setRelationshipTypes(initialData.relationshipTypes ?? []);
      setIsFavorite(initialData.isFavorite ?? false);
      setNotes(initialData.notes ?? "");
      setFirstMetDate(initialData.firstMetDate ?? "");
      setFriendshipAnniversary(initialData.friendshipAnniversary ?? "");
      setLastMetDate(initialData.lastMetDate ?? "");
      setLastCallDate(initialData.lastCallDate ?? "");
      setLastMessageDate(initialData.lastMessageDate ?? "");
    } else {
      setName(""); setNickname(""); setGender(""); setBirthday(""); setPhone(""); setEmail("");
      setAddress(""); setCountry(""); setCity(""); setOccupation("");
      setSocialLinks([]); setRelationshipTypes([]); setIsFavorite(false); setNotes("");
      setFirstMetDate(""); setFriendshipAnniversary(""); setLastMetDate(""); setLastCallDate(""); setLastMessageDate("");
    }
  }, [opened, initialData]);

  const mutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = isEditing ? `/api/network/connections/${initialData!.id}` : "/api/network/connections";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save connection");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network-connections"] });
      queryClient.invalidateQueries({ queryKey: ["network-dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["network-birthdays"] });
      queryClient.invalidateQueries({ queryKey: ["network-insights"] });
      notifications.show({ title: isEditing ? "Updated" : "Created", message: `Connection ${isEditing ? "updated" : "created"} successfully`, color: "green" });
      onClose();
    },
    onError: (err) => {
      notifications.show({ title: "Error", message: err instanceof Error ? err.message : "Something went wrong", color: "red" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/network/connections/${initialData!.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete connection");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network-connections"] });
      queryClient.invalidateQueries({ queryKey: ["network-dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["network-birthdays"] });
      notifications.show({ title: "Deleted", message: "Connection deleted", color: "green" });
      onClose();
    },
  });

  function handleSave() {
    if (!name.trim()) { notifications.show({ title: "Validation", message: "Name is required", color: "red" }); return; }
    mutation.mutate({
      name: name.trim(),
      nickname: nickname || undefined,
      gender: gender || undefined,
      birthday: birthday || undefined,
      phone: phone || undefined,
      email: email || undefined,
      address: address || undefined,
      country: country || undefined,
      city: city || undefined,
      occupation: occupation || undefined,
      socialLinks: socialLinks.length > 0 ? socialLinks : undefined,
      relationshipTypes: relationshipTypes.length > 0 ? relationshipTypes : undefined,
      isFavorite,
      notes: notes || undefined,
      firstMetDate: firstMetDate || undefined,
      friendshipAnniversary: friendshipAnniversary || undefined,
      lastMetDate: lastMetDate || undefined,
      lastCallDate: lastCallDate || undefined,
      lastMessageDate: lastMessageDate || undefined,
    });
  }

  return (
    <Modal opened={opened} onClose={onClose} title={isEditing ? "Edit Connection" : "Add Connection"} size="lg">
      <Stack>
        <TextInput label="Name" required value={name} onChange={(e) => setName(e.currentTarget.value)} />
        <TextInput label="Nickname" value={nickname} onChange={(e) => setNickname(e.currentTarget.value)} />
        <SimpleGrid cols={2}>
          <TextInput label="Gender" value={gender} onChange={(e) => setGender(e.currentTarget.value)} />
          <TextInput label="Birthday (YYYY-MM-DD)" value={birthday} onChange={(e) => setBirthday(e.currentTarget.value)} placeholder="1990-01-15" />
        </SimpleGrid>
        <SimpleGrid cols={2}>
          <TextInput label="Phone" value={phone} onChange={(e) => setPhone(e.currentTarget.value)} />
          <TextInput label="Email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
        </SimpleGrid>
        <TextInput label="Address" value={address} onChange={(e) => setAddress(e.currentTarget.value)} />
        <SimpleGrid cols={2}>
          <TextInput label="City" value={city} onChange={(e) => setCity(e.currentTarget.value)} />
          <TextInput label="Country" value={country} onChange={(e) => setCountry(e.currentTarget.value)} />
        </SimpleGrid>
        <TextInput label="Occupation" value={occupation} onChange={(e) => setOccupation(e.currentTarget.value)} />

        <div>
          <Text size="sm" fw={500} mb={4}>Social Links</Text>
          <Group gap="xs" mb={4}>
            {socialLinks.map((link, i) => (
              <Badge key={i} variant="light" rightSection={<CloseButton size={12} onMouseDown={() => setSocialLinks((prev) => prev.filter((_, j) => j !== i))} />}>{link}</Badge>
            ))}
          </Group>
          <Group gap="xs">
            <TextInput value={newLink} onChange={(e) => setNewLink(e.currentTarget.value)} placeholder="https://..." style={{ flex: 1 }} />
            <Button size="sm" variant="light" onClick={() => { if (newLink.trim()) { setSocialLinks((prev) => [...prev, newLink.trim()]); setNewLink(""); } }}>Add</Button>
          </Group>
        </div>

        <div>
          <Text size="sm" fw={500} mb={4}>Relationship Types</Text>
          <Group gap="xs" mb={4}>
            {relationshipTypes.map((r, i) => (
              <Badge key={i} variant="light" rightSection={<CloseButton size={12} onMouseDown={() => setRelationshipTypes((prev) => prev.filter((_, j) => j !== i))} />}>{r}</Badge>
            ))}
          </Group>
          <Group gap="xs">
            <TextInput value={newRelation} onChange={(e) => setNewRelation(e.currentTarget.value)} placeholder="Best Friend, College Friend..." style={{ flex: 1 }} />
            <Button size="sm" variant="light" onClick={() => { if (newRelation.trim()) { setRelationshipTypes((prev) => [...prev, newRelation.trim()]); setNewRelation(""); } }}>Add</Button>
          </Group>
        </div>

        <Switch label="Mark as favorite" checked={isFavorite} onChange={(e) => setIsFavorite(e.currentTarget.checked)} />

        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} minRows={3} />

        <Text fw={500} size="sm">Important Dates</Text>
        <SimpleGrid cols={2}>
          <TextInput label="First met" type="date" value={firstMetDate} onChange={(e) => setFirstMetDate(e.currentTarget.value)} />
          <TextInput label="Friendship anniversary" type="date" value={friendshipAnniversary} onChange={(e) => setFriendshipAnniversary(e.currentTarget.value)} />
          <TextInput label="Last met" type="date" value={lastMetDate} onChange={(e) => setLastMetDate(e.currentTarget.value)} />
          <TextInput label="Last call" type="date" value={lastCallDate} onChange={(e) => setLastCallDate(e.currentTarget.value)} />
          <TextInput label="Last message" type="date" value={lastMessageDate} onChange={(e) => setLastMessageDate(e.currentTarget.value)} />
        </SimpleGrid>

        <Group justify="space-between" mt="md">
          {isEditing && (
            <Button color="red" variant="light" loading={deleteMutation.isPending} onClick={() => { if (confirm("Delete this connection?")) deleteMutation.mutate(); }}>
              Delete
            </Button>
          )}
          <Group ml="auto">
            <Button variant="subtle" onClick={onClose}>Cancel</Button>
            <Button loading={mutation.isPending} onClick={handleSave}>{isEditing ? "Update" : "Create"}</Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}

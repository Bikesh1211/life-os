"use client";

import { useState, useEffect } from "react";
import { Modal, TextInput, Select, Stack, Group, Button, Switch, JsonInput, Text } from "@mantine/core";
import { Editor } from "@/components/editor";
import { textToEditorContent, textFromEditor } from "@/components/editor/utils";
import { TECH_CATEGORIES, OWNERSHIP_STATUSES, CONDITIONS } from "@/modules/tech-gear/constants";

interface FormData {
  name: string; brand: string; model: string; category: string | null;
  serialNumber: string; color: string; location: string;
  purchasePrice: string; warrantyProvider: string;
  ownershipStatus: string | null; condition: string | null;
  loanedTo: string; isFavorite: boolean; notes: string;
}

const defaultForm: FormData = {
  name: "", brand: "", model: "", category: "laptops",
  serialNumber: "", color: "", location: "",
  purchasePrice: "", warrantyProvider: "",
  ownershipStatus: "owned", condition: "good",
  loanedTo: "", isFavorite: false, notes: "",
};

export default function ItemFormModal({
  opened, onClose, onSave, item,
}: {
  opened: boolean; onClose: () => void; onSave: (data: any) => void; item?: any;
}) {
  const [form, setForm] = useState<FormData>(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || "", brand: item.brand || "", model: item.model || "",
        category: item.category || "laptops",
        serialNumber: item.serialNumber || "", color: item.color || "", location: item.location || "",
        purchasePrice: item.purchasePrice || "", warrantyProvider: item.warrantyProvider || "",
        ownershipStatus: item.ownershipStatus || "owned", condition: item.condition || "good",
        loanedTo: item.loanedTo || "", isFavorite: item.isFavorite || false, notes: item.notes || "",
      });
    } else {
      setForm(defaultForm);
    }
  }, [item, opened]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={item ? "Edit Item" : "Add New Item"} size="lg">
      <Stack gap="sm">
        <TextInput label="Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Group grow>
          <Select label="Category" required data={TECH_CATEGORIES.map(c => ({ value: c, label: c.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") }))}
            value={form.category} onChange={v => setForm({ ...form, category: v })} searchable />
          <TextInput label="Brand" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
          <TextInput label="Model" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
        </Group>
        <Group grow>
          <TextInput label="Serial Number" value={form.serialNumber} onChange={e => setForm({ ...form, serialNumber: e.target.value })} />
          <TextInput label="Color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
          <TextInput label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
        </Group>
        <Group grow>
          <TextInput label="Purchase Price ($)" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} />
          <TextInput label="Warranty Provider" value={form.warrantyProvider} onChange={e => setForm({ ...form, warrantyProvider: e.target.value })} />
        </Group>
        <Group grow>
          <Select label="Status" data={OWNERSHIP_STATUSES.map(s => ({ value: s, label: s.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") }))}
            value={form.ownershipStatus} onChange={v => setForm({ ...form, ownershipStatus: v })} />
          <Select label="Condition" data={CONDITIONS.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
            value={form.condition} onChange={v => setForm({ ...form, condition: v })} />
        </Group>
        {form.ownershipStatus === "loaned-out" && (
          <TextInput label="Loaned To" value={form.loanedTo} onChange={e => setForm({ ...form, loanedTo: e.target.value })} />
        )}
        <Text size="sm" fw={500}>Notes</Text>
        <Editor
          content={textToEditorContent(form.notes)}
          onChange={(_json, _html, text) => setForm({ ...form, notes: text })}
          placeholder="Notes"
          minHeight="80px"
          showToolbar={false}
        />
        <Switch label="Mark as Favorite" checked={form.isFavorite} onChange={e => setForm({ ...form, isFavorite: e.target.checked })} />
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{item ? "Save Changes" : "Add Item"}</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

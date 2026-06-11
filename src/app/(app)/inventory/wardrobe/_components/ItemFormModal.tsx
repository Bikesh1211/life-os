"use client";

import { useState, useEffect } from "react";
import { Modal, TextInput, Select, Stack, Group, Button, Textarea, NumberInput, Switch, SegmentedControl } from "@mantine/core";
import { CLOTHING_CATEGORIES, CLOTHING_SUBCATEGORIES, COLORS, SIZES, CONDITIONS, SEASONS } from "@/modules/wardrobe/constants";

interface ItemFormData {
  name: string;
  description: string;
  category: string | null;
  subcategory: string | null;
  brand: string;
  color: string | null;
  size: string | null;
  material: string;
  condition: string | null;
  season: string | null;
  purchasePrice: string;
  currentValue: string;
  isFavorite: boolean;
  notes: string;
}

const defaultForm: ItemFormData = {
  name: "", description: "", category: "tops", subcategory: null, brand: "",
  color: null, size: null, material: "", condition: "good", season: "all-season",
  purchasePrice: "", currentValue: "", isFavorite: false, notes: "",
};

export default function ItemFormModal({
  opened, onClose, onSave, item,
}: {
  opened: boolean; onClose: () => void; onSave: (data: any) => void; item?: any;
}) {
  const [form, setForm] = useState<ItemFormData>(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || "",
        description: item.description || "",
        category: item.category || null,
        subcategory: item.subcategory || null,
        brand: item.brand || "",
        color: item.color || null,
        size: item.size || null,
        material: item.material || "",
        condition: item.condition || "good",
        season: item.season || "all-season",
        purchasePrice: item.purchasePrice || "",
        currentValue: item.currentValue || "",
        isFavorite: item.isFavorite || false,
        notes: item.notes || "",
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

  const subcategories = form.category ? CLOTHING_SUBCATEGORIES[form.category] || [] : [];

  return (
    <Modal opened={opened} onClose={onClose} title={item ? "Edit Item" : "Add New Item"} size="lg">
      <Stack gap="sm">
        <TextInput label="Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

        <Group grow>
          <Select label="Category" required data={CLOTHING_CATEGORIES.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
            value={form.category} onChange={v => setForm({ ...form, category: v, subcategory: null })} searchable />
          <Select label="Subcategory" data={subcategories.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
            value={form.subcategory} onChange={v => setForm({ ...form, subcategory: v })} searchable clearable disabled={!form.category} />
        </Group>

        <Group grow>
          <TextInput label="Brand" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
          <Select label="Color" data={COLORS.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
            value={form.color} onChange={v => setForm({ ...form, color: v })} searchable clearable />
        </Group>

        <Group grow>
          <Select label="Size" data={SIZES.map(s => ({ value: s, label: s.toUpperCase() }))}
            value={form.size} onChange={v => setForm({ ...form, size: v })} searchable clearable />
          <TextInput label="Material" value={form.material} onChange={e => setForm({ ...form, material: e.target.value })} />
        </Group>

        <Group grow>
          <Select label="Condition" data={CONDITIONS.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
            value={form.condition} onChange={v => setForm({ ...form, condition: v })} />
          <Select label="Season" data={SEASONS.map(s => ({ value: s, label: s === "all-season" ? "All Season" : s.charAt(0).toUpperCase() + s.slice(1) }))}
            value={form.season} onChange={v => setForm({ ...form, season: v })} />
        </Group>

        <Group grow>
          <TextInput label="Purchase Price ($)" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} />
          <TextInput label="Current Value ($)" value={form.currentValue} onChange={e => setForm({ ...form, currentValue: e.target.value })} />
        </Group>

        <Textarea label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />

        <Switch label="Mark as Favorite" checked={form.isFavorite} onChange={e => setForm({ ...form, isFavorite: e.target.checked })} />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{item ? "Save Changes" : "Add Item"}</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

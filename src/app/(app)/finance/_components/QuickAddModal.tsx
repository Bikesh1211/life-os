"use client";

import {
  Modal,
  TextInput,
  NumberInput,
  Select,
  Button,
  Group,
  Stack,
  Textarea,
  Switch,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PAYMENT_METHODS } from "@/modules/expenses/constants";

type QuickAddModalProps = {
  opened: boolean;
  onClose: () => void;
  categories: { value: string; label: string }[];
  accounts: { value: string; label: string }[];
};

export function QuickAddModal({
  opened,
  onClose,
  categories,
  accounts,
}: QuickAddModalProps) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      amount: undefined as number | undefined,
      merchant: "",
      categoryId: "",
      accountId: "",
      paymentMethod: "",
      description: "",
      notes: "",
      isRecurring: false,
    },
  });

  async function handleSubmit(values: typeof form.values) {
    setLoading(true);
    try {
      const body = {
        amount: String(values.amount ?? 0),
        merchant: values.merchant || undefined,
        categoryId: values.categoryId || undefined,
        accountId: values.accountId || undefined,
        paymentMethod: values.paymentMethod || undefined,
        description: values.description || undefined,
        notes: values.notes || undefined,
        isRecurring: values.isRecurring,
        transactionDate: new Date().toISOString(),
        type: "expense",
      };

      const res = await fetch("/api/expenses/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to create transaction");

      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      form.reset();
      onClose();
    } catch {
      // TODO: show notification
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add Expense"
      size="lg"
      radius="lg"
      closeOnClickOutside={false}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <NumberInput
            label="Amount"
            placeholder="0.00"
            prefix="₹ "
            decimalScale={2}
            fixedDecimalScale
            autoFocus
            key={form.key("amount")}
            {...form.getInputProps("amount")}
            required
          />

          <TextInput
            label="Merchant"
            placeholder="Search or type merchant"
            key={form.key("merchant")}
            {...form.getInputProps("merchant")}
          />

          <Group grow>
            <Select
              label="Category"
              placeholder="Select category"
              data={categories}
              searchable
              clearable
              key={form.key("categoryId")}
              {...form.getInputProps("categoryId")}
            />
            <Select
              label="Account"
              placeholder="Select account"
              data={accounts}
              searchable
              clearable
              key={form.key("accountId")}
              {...form.getInputProps("accountId")}
            />
          </Group>

          <Group grow>
            <Select
              label="Payment Method"
              placeholder="Select method"
              data={PAYMENT_METHODS.map((m) => ({
                value: m,
                label: m.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
              }))}
              clearable
              key={form.key("paymentMethod")}
              {...form.getInputProps("paymentMethod")}
            />
          </Group>

          <TextInput
            label="Description"
            placeholder="Optional description"
            key={form.key("description")}
            {...form.getInputProps("description")}
          />

          <Textarea
            label="Notes"
            placeholder="Add notes..."
            rows={2}
            key={form.key("notes")}
            {...form.getInputProps("notes")}
          />

          <Switch
            label="Recurring transaction"
            key={form.key("isRecurring")}
            {...form.getInputProps("isRecurring", { type: "checkbox" })}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Add Expense
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

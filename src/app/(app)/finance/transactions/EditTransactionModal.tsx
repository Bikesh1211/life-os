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
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { PAYMENT_METHODS, TRANSACTION_TYPES } from "@/modules/expenses/constants";

type Transaction = {
  id: string;
  amount: string;
  merchant: string | null;
  description: string | null;
  categoryId: string | null;
  paymentMethod: string | null;
  transactionDate: string;
  type: string;
  isRecurring: boolean;
  accountId: string | null;
  notes?: string | null;
};

type EditTransactionModalProps = {
  transaction: Transaction | null;
  opened: boolean;
  onClose: () => void;
  categories: { value: string; label: string }[];
  accounts: { value: string; label: string }[];
};

export function EditTransactionModal({
  transaction,
  opened,
  onClose,
  categories,
  accounts,
}: EditTransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      amount: undefined as number | undefined,
      merchant: "",
      description: "",
      categoryId: "",
      accountId: "",
      paymentMethod: "",
      type: "expense" as string,
      transactionDate: "",
      notes: "",
      isRecurring: false,
    },
  });

  useEffect(() => {
    if (transaction) {
      form.setValues({
        amount: Number(transaction.amount),
        merchant: transaction.merchant ?? "",
        description: transaction.description ?? "",
        categoryId: transaction.categoryId ?? "",
        accountId: transaction.accountId ?? "",
        paymentMethod: transaction.paymentMethod ?? "",
        type: transaction.type,
        transactionDate: dayjs(transaction.transactionDate).format("YYYY-MM-DD"),
        notes: "",
        isRecurring: transaction.isRecurring,
      });
      form.resetDirty();
    }
  }, [transaction]);

  async function handleSubmit(values: typeof form.values) {
    if (!transaction) return;
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        amount: String(values.amount ?? 0),
        merchant: values.merchant || undefined,
        description: values.description || undefined,
        categoryId: values.categoryId || undefined,
        accountId: values.accountId || undefined,
        paymentMethod: values.paymentMethod || undefined,
        type: values.type,
        transactionDate: dayjs(values.transactionDate).toISOString(),
        isRecurring: values.isRecurring,
      };

      const res = await fetch(`/api/expenses/transactions/${transaction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to update transaction");

      queryClient.invalidateQueries({ queryKey: ["expenses"] });
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
      title="Edit Transaction"
      size="lg"
      radius="lg"
      closeOnClickOutside={false}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Select
            label="Type"
            data={TRANSACTION_TYPES.map((t) => ({
              value: t,
              label: t.charAt(0).toUpperCase() + t.slice(1),
            }))}
            key={form.key("type")}
            {...form.getInputProps("type")}
          />

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
            placeholder="Merchant name"
            key={form.key("merchant")}
            {...form.getInputProps("merchant")}
          />

          <TextInput
            label="Date"
            type="date"
            key={form.key("transactionDate")}
            {...form.getInputProps("transactionDate")}
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

          <Textarea
            label="Description"
            placeholder="Optional description"
            rows={2}
            key={form.key("description")}
            {...form.getInputProps("description")}
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
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

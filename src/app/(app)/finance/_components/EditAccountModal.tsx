"use client";

import { Modal, TextInput, Select, Button, Group, Stack, SegmentedControl } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useState, useEffect } from "react";
import { ACCOUNT_TYPES } from "@/modules/expenses/constants";
import { apiFetch } from "@/core/api/http";

type Account = {
  id: string;
  name: string;
  type: string;
  balance: string;
  currency: string;
};

type EditAccountModalProps = {
  account: Account | null;
  opened: boolean;
  onClose: () => void;
};

export function EditAccountModal({ account, opened, onClose }: EditAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [balanceMode, setBalanceMode] = useState<"set" | "adjust">("set");
  const queryClient = useQueryClient();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      type: "checking" as string,
      balance: "",
      adjustmentAmount: "",
    },
  });

  useEffect(() => {
    if (account) {
      form.setValues({
        name: account.name,
        type: account.type,
        balance: account.balance,
        adjustmentAmount: "",
      });
      form.resetDirty();
    }
  }, [account]);

  async function handleSubmit(values: typeof form.values) {
    if (!account) return;
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        name: values.name,
        type: values.type,
      };

      if (balanceMode === "set" && values.balance !== account.balance) {
        body.balance = values.balance;
      }

      if (balanceMode === "adjust" && values.adjustmentAmount) {
        body.adjustmentAmount = values.adjustmentAmount;
      }

      await apiFetch(`/api/expenses/accounts/${account.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      notifications.show({ title: "Updated", message: "Account updated", color: "green" });
      queryClient.invalidateQueries({ queryKey: ["expenses", "accounts"] });
      onClose();
    } catch {
      notifications.show({ title: "Error", message: "Failed to update account", color: "red" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!account) return;
    if (!confirm(`Delete account "${account.name}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await apiFetch(`/api/expenses/accounts/${account.id}`, {
        method: "DELETE",
      });
      notifications.show({ title: "Deleted", message: "Account deleted", color: "orange" });
      queryClient.invalidateQueries({ queryKey: ["expenses", "accounts"] });
      onClose();
    } catch {
      notifications.show({ title: "Error", message: "Failed to delete account", color: "red" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Account" size="lg" radius="lg" closeOnClickOutside={false}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Account Name"
            placeholder="e.g. Primary Bank"
            required
            key={form.key("name")}
            {...form.getInputProps("name")}
          />

          <Select
            label="Account Type"
            data={ACCOUNT_TYPES.map((t) => ({
              value: t,
              label: t.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            }))}
            required
            key={form.key("type")}
            {...form.getInputProps("type")}
          />

          <SegmentedControl
            value={balanceMode}
            onChange={(v) => setBalanceMode(v as "set" | "adjust")}
            data={[
              { value: "set", label: "Set balance" },
              { value: "adjust", label: "Add / Subtract" },
            ]}
            fullWidth
            size="xs"
          />

          {balanceMode === "set" ? (
            <TextInput
              label="Balance"
              placeholder="0"
              key={form.key("balance")}
              {...form.getInputProps("balance")}
            />
          ) : (
            <TextInput
              label="Adjustment amount"
              description="Use positive for income, negative for expense"
              placeholder="e.g. 5000 or -2000"
              key={form.key("adjustmentAmount")}
              {...form.getInputProps("adjustmentAmount")}
            />
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="red" onClick={handleDelete} loading={loading}>
              Delete
            </Button>
            <Group>
              <Button variant="subtle" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Save Changes
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

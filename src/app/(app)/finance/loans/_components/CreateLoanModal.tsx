"use client";

import { useState } from "react";
import {
  TextInput, Select, Stack, Group, Button, NumberInput, Textarea,
  SegmentedControl, Text, Switch,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import { apiFetch, ApiError } from "@/core/api/http";

interface Props {
  onClose: () => void;
}

export default function CreateLoanModal({ onClose }: Props) {
  const [direction, setDirection] = useState<"lent" | "borrowed">("lent");
  const [connectionName, setConnectionName] = useState("");
  const [connectionPhone, setConnectionPhone] = useState("");
  const [connectionEmail, setConnectionEmail] = useState("");
  const [principalAmount, setPrincipalAmount] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("");
  const [interestType, setInterestType] = useState<string>("none");
  const [loanDate, setLoanDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [hasInstallments, setHasInstallments] = useState(false);
  const [installmentCount, setInstallmentCount] = useState<string>("");
  const [installmentAmount, setInstallmentAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!principalAmount) {
      notifications.show({ title: "Error", message: "Amount is required", color: "red" });
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        direction,
        principalAmount,
        interestType,
        loanDate: loanDate.toISOString(),
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        purpose: purpose || undefined,
        notes: notes || undefined,
        connectionName: connectionName || undefined,
        connectionPhone: connectionPhone || undefined,
        connectionEmail: connectionEmail || undefined,
      };

      if (interestType !== "none" && interestRate) {
        body.interestRate = interestRate;
      }

      if (hasInstallments) {
        body.installmentCount = installmentCount;
        body.installmentAmount = installmentAmount;
      }

      await apiFetch("/api/loans", {
        method: "POST",
        body: JSON.stringify(body),
      });

      notifications.show({
        title: "Success",
        message: `Loan created successfully`,
        color: "green",
      });
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiError &&
        err.body &&
        typeof err.body === "object" &&
        "message" in err.body
          ? String((err.body as { message: unknown }).message)
          : err instanceof Error
            ? err.message
            : "Something went wrong";
      notifications.show({
        title: "Error",
        message,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="md">
      <div>
        <Text size="sm" fw={500} mb={4}>Direction</Text>
        <SegmentedControl
          value={direction}
          onChange={(v) => setDirection(v as "lent" | "borrowed")}
          data={[
            { value: "lent", label: "I Lent Money" },
            { value: "borrowed", label: "I Borrowed Money" },
          ]}
          fullWidth
          radius="lg"
        />
      </div>

      <Text fw={600} size="sm">Person</Text>
      <Group grow>
        <TextInput
          label="Name"
          placeholder="Full name"
          value={connectionName}
          onChange={(e) => setConnectionName(e.currentTarget.value)}
          radius="lg"
        />
        <TextInput
          label="Phone"
          placeholder="Phone number"
          value={connectionPhone}
          onChange={(e) => setConnectionPhone(e.currentTarget.value)}
          radius="lg"
        />
      </Group>
      <TextInput
        label="Email"
        placeholder="Email address"
        value={connectionEmail}
        onChange={(e) => setConnectionEmail(e.currentTarget.value)}
        radius="lg"
      />

      <Text fw={600} size="sm">Loan Details</Text>
      <Group grow>
        <TextInput
          label="Principal Amount"
          placeholder="1000"
          value={principalAmount}
          onChange={(e) => setPrincipalAmount(e.currentTarget.value)}
          radius="lg"
          required
        />
        <Select
          label="Interest Type"
          data={[
            { value: "none", label: "None" },
            { value: "simple", label: "Simple" },
            { value: "compound", label: "Compound" },
          ]}
          value={interestType}
          onChange={(v) => setInterestType(v ?? "none")}
          radius="lg"
        />
      </Group>

      {interestType !== "none" && (
        <TextInput
          label="Interest Rate (%)"
          placeholder="10"
          value={interestRate}
          onChange={(e) => setInterestRate(e.currentTarget.value)}
          radius="lg"
        />
      )}

      <Group grow>
        <DatePickerInput
          label="Loan Date"
          value={loanDate}
          onChange={(val: string | null) => setLoanDate(val ? new Date(val) : new Date())}
          radius="lg"
        />
        <DatePickerInput
          label="Due Date (optional)"
          value={dueDate}
          onChange={(val: string | null) => setDueDate(val ? new Date(val) : null)}
          clearable
          radius="lg"
        />
      </Group>

      <TextInput
        label="Purpose"
        placeholder="e.g. Wedding gift, Emergency, Business"
        value={purpose}
        onChange={(e) => setPurpose(e.currentTarget.value)}
        radius="lg"
      />

      <Textarea
        label="Notes"
        placeholder="Any additional details..."
        value={notes}
        onChange={(e) => setNotes(e.currentTarget.value)}
        minRows={2}
        radius="lg"
      />

      <Switch
        label="Set up installment plan"
        checked={hasInstallments}
        onChange={(e) => setHasInstallments(e.currentTarget.checked)}
      />

      {hasInstallments && (
        <Group grow>
          <TextInput
            label="Number of Installments"
            placeholder="12"
            value={installmentCount}
            onChange={(e) => setInstallmentCount(e.currentTarget.value)}
            radius="lg"
          />
          <TextInput
            label="Installment Amount"
            placeholder="100"
            value={installmentAmount}
            onChange={(e) => setInstallmentAmount(e.currentTarget.value)}
            radius="lg"
          />
        </Group>
      )}

      <Group justify="flex-end" mt="md">
        <Button variant="subtle" onClick={onClose} radius="lg">
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={loading} radius="lg">
          Create Loan
        </Button>
      </Group>
    </Stack>
  );
}

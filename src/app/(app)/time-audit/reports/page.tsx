"use client";

import { useState } from "react";
import {
  Stack,
  Group,
  Text,
  Paper,
  Title,
  Button,
  Select,
  Container,
  Anchor,
  TextInput,
} from "@mantine/core";
import { IconDownload, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

export default function ReportsPage() {
  const [period, setPeriod] = useState<string | null>("week");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [loading, setLoading] = useState(false);

  const getDateRange = () => {
    if (period === "custom") {
      return { dateFrom: customFrom, dateTo: customTo };
    }
    const now = dayjs();
    switch (period) {
      case "today":
        return { dateFrom: now.startOf("day").format("YYYY-MM-DD"), dateTo: now.endOf("day").format("YYYY-MM-DD") };
      case "week":
        return { dateFrom: now.startOf("isoWeek").format("YYYY-MM-DD"), dateTo: now.endOf("isoWeek").format("YYYY-MM-DD") };
      case "month":
        return { dateFrom: now.startOf("month").format("YYYY-MM-DD"), dateTo: now.endOf("month").format("YYYY-MM-DD") };
      default:
        return { dateFrom: now.startOf("day").format("YYYY-MM-DD"), dateTo: now.endOf("day").format("YYYY-MM-DD") };
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const { dateFrom, dateTo } = getDateRange();
      const res = await fetch(`/api/time-audit/reports?dateFrom=${dateFrom}&dateTo=${dateTo}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `time-audit-${dateFrom}-${dateTo}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="md">
      <Anchor component={Link} href="/time-audit" size="sm" mb="md">
        <Group gap={4}>
          <IconArrowLeft size={14} />
          Back to Dashboard
        </Group>
      </Anchor>

      <Title order={2} mb="lg">Export Reports</Title>

      <Paper withBorder p="lg" radius="lg">
        <Stack gap="md">
          <Select
            label="Report Period"
            value={period}
            onChange={setPeriod}
            data={[
              { value: "today", label: "Today" },
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
              { value: "custom", label: "Custom Range" },
            ]}
          />

          {period === "custom" && (
            <Group grow>
              <TextInput
                label="From"
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
              <TextInput
                label="To"
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </Group>
          )}

          <Group justify="space-between" mt="md">
            <Text size="sm" c="dimmed">
              Export your time entries as CSV. Compatible with Excel, Google Sheets, and other spreadsheet tools.
            </Text>
            <Button
              leftSection={<IconDownload size={16} />}
              onClick={handleExport}
              loading={loading}
            >
              Export CSV
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}

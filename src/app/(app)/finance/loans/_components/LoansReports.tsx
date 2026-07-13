"use client";

import { Card, Text, Stack, Group, Button, SimpleGrid, SegmentedControl, ThemeIcon } from "@mantine/core";
import { IconFileSpreadsheet, IconFileDescription, IconDownload } from "@tabler/icons-react";
import { useState } from "react";

export default function LoansReports() {
  const [period, setPeriod] = useState<string>("monthly");

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={600} size="lg">Reports</Text>
        <SegmentedControl
          value={period}
          onChange={setPeriod}
          data={[
            { value: "weekly", label: "Weekly" },
            { value: "monthly", label: "Monthly" },
            { value: "quarterly", label: "Quarterly" },
            { value: "yearly", label: "Yearly" },
          ]}
          radius="lg"
          size="sm"
        />
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        <Card withBorder radius="lg" padding="lg">
          <Stack align="center" gap="sm">
            <ThemeIcon size={48} radius="xl" color="green" variant="light">
              <IconFileSpreadsheet size={24} />
            </ThemeIcon>
            <Text fw={500}>Export as CSV</Text>
            <Text size="xs" c="dimmed" ta="center">
              Download all loans data as a CSV file for spreadsheet analysis
            </Text>
            <Button
              variant="light"
              fullWidth
              radius="lg"
              leftSection={<IconDownload size={16} />}
              onClick={() => window.open("/api/loans/export/csv", "_blank")}
            >
              Download CSV
            </Button>
          </Stack>
        </Card>

        <Card withBorder radius="lg" padding="lg">
          <Stack align="center" gap="sm">
            <ThemeIcon size={48} radius="xl" color="blue" variant="light">
              <IconFileDescription size={24} />
            </ThemeIcon>
            <Text fw={500}>Print Summary</Text>
            <Text size="xs" c="dimmed" ta="center">
              Open a print-friendly view of your loan summary
            </Text>
            <Button
              variant="light"
              fullWidth
              radius="lg"
              leftSection={<IconDownload size={16} />}
              onClick={() => window.print()}
            >
              Print / PDF
            </Button>
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}

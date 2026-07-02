"use client";

import {
  Container,
  Stack,
  Title,
  Text,
  SimpleGrid,
  Card,
  Group,
  ThemeIcon,
  Button,
  Modal,
  TextInput,
  Select,
  ActionIcon,
  Menu,
} from "@mantine/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import {
  IconWallet,
  IconBuildingBank,
  IconCreditCard,
  IconCash,
  IconDeviceMobile,
  IconTrendingUp,
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconCashPlus,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { ACCOUNT_TYPES } from "@/modules/expenses/constants";
import { EditAccountModal } from "./EditAccountModal";

type Account = {
  id: string;
  name: string;
  type: string;
  balance: string;
  currency: string;
  icon: string | null;
  color: string | null;
  isArchived: boolean;
};

const accountIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  checking: IconBuildingBank,
  savings: IconBuildingBank,
  credit: IconCreditCard,
  cash: IconCash,
  wallet: IconDeviceMobile,
  investment: IconTrendingUp,
};

const accountColors: Record<string, string> = {
  checking: "blue",
  savings: "green",
  credit: "red",
  cash: "teal",
  wallet: "violet",
  investment: "yellow",
};

export default function AccountsTab() {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const queryClient = useQueryClient();

  const { data: accounts, isLoading } = useQuery<Account[]>({
    queryKey: ["expenses", "accounts"],
    queryFn: () => fetch("/api/expenses/accounts").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      type: "checking",
      balance: "0",
      currency: "NPR",
    },
  });

  async function handleSubmit(values: typeof form.values) {
    setLoading(true);
    try {
      const res = await fetch("/api/expenses/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to create account");
      notifications.show({ title: "Created", message: "Account created", color: "green" });
      queryClient.invalidateQueries({ queryKey: ["expenses", "accounts"] });
      form.reset();
      close();
    } catch {
      notifications.show({ title: "Error", message: "Failed to create account", color: "red" });
    } finally {
      setLoading(false);
    }
  }

  const totalBalance = accounts?.reduce((sum, a) => sum + Number(a.balance), 0) ?? 0;

  return (
    <Container size="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Accounts</Title>
            <Text c="dimmed" size="sm">
              Total Balance: ₹{totalBalance.toLocaleString()}
            </Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={open} radius="xl">
            Add Account
          </Button>
        </Group>

        {isLoading ? (
          <Text c="dimmed">Loading accounts...</Text>
        ) : !accounts?.length ? (
          <Card padding="xl" radius="lg" ta="center">
            <ThemeIcon size={60} radius="xl" mx="auto" mb="md">
              <IconWallet size={30} />
            </ThemeIcon>
            <Text fw={500}>No accounts yet</Text>
            <Text size="sm" c="dimmed" mb="md">
              Create your first financial account to start tracking.
            </Text>
            <Button onClick={open}>Create Account</Button>
          </Card>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {accounts.map((account, index) => {
              const Icon = accountIcons[account.type] ?? IconWallet;
              const color = account.color ?? accountColors[account.type] ?? "gray";

              return (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    padding="lg"
                    radius="lg"
                    style={{
                      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
                      borderColor: `${color}30`,
                    }}
                  >
                    <Group justify="space-between" mb="xs">
                      <Group gap="sm">
                        <ThemeIcon size={44} radius="md" color={color} variant="light">
                          <Icon size={22} />
                        </ThemeIcon>
                        <div>
                          <Text fw={600}>{account.name}</Text>
                          <Text size="xs" c="dimmed" tt="capitalize">
                            {account.type.replace(/_/g, " ")}
                          </Text>
                        </div>
                      </Group>
                      <Menu shadow="md" width={180}>
                        <Menu.Target>
                          <ActionIcon variant="subtle" size="sm">
                            <IconDotsVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            onClick={() => setEditAccount(account)}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconCashPlus size={14} />}
                            onClick={() => setEditAccount(account)}
                          >
                            Add Income
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>

                    <Text size="28px" fw={700}>
                      ₹{Number(account.balance).toLocaleString()}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {account.currency}
                    </Text>
                  </Card>
                </motion.div>
              );
            })}
          </SimpleGrid>
        )}
      </Stack>

      <Modal opened={opened} onClose={close} title="Add Account" radius="lg">
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
            <TextInput
              label="Initial Balance"
              placeholder="0"
              key={form.key("balance")}
              {...form.getInputProps("balance")}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <EditAccountModal
        account={editAccount}
        opened={!!editAccount}
        onClose={() => setEditAccount(null)}
      />
    </Container>
  );
}

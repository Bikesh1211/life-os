"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stack, Title, Group, Button, Tabs } from "@mantine/core";
import {
  IconChecklist,
  IconCalendarDue,
  IconInbox,
  IconFolder,
  IconRepeat,
  IconTags,
  IconFocusCentered,
  IconPlus,
} from "@tabler/icons-react";
import { DashboardContent } from "./DashboardContent";
import { TodayContent } from "./today/TodayContent";
import { InboxContent } from "./inbox/InboxContent";
import { ProjectsContent } from "./projects/ProjectsContent";
import { ProjectDetailContent } from "./projects/ProjectDetailContent";
import { UpcomingContent } from "./upcoming/UpcomingContent";
import { RecurringContent } from "./recurring/RecurringContent";
import { LabelsContent } from "./labels/LabelsContent";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";
import { TaskFormModal } from "@/modules/tasks/components/TaskFormModal";

type Props = {
  taskSummary?: any;
  initialTasks?: any[];
  defaultTab?: string;
};

export function TasksContent({ taskSummary, initialTasks, defaultTab = "dashboard" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string | null>(
    searchParams.get("tab") ?? defaultTab,
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setShowCreate(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("create");
      router.replace(`/tasks${params.toString() ? `?${params}` : ""}`, { scroll: false });
    }
  }, [searchParams, router]);

  const handleTabChange = useCallback(
    (value: string | null) => {
      setActiveTab(value);
      setSelectedProjectId(null);
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "dashboard") {
        params.set("tab", value);
      } else {
        params.delete("tab");
      }
      const qs = params.toString();
      router.replace(`/tasks${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={2}>Tasks</Title>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={() => setShowCreate(true)}
          variant="light"
          size="sm"
        >
          New Task
        </Button>
      </Group>

      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tabs.List>
          <Tabs.Tab value="dashboard" leftSection={<IconChecklist size={16} />}>
            Dashboard
          </Tabs.Tab>
          <Tabs.Tab value="today" leftSection={<IconCalendarDue size={16} />}>
            Today
          </Tabs.Tab>
          <Tabs.Tab value="inbox" leftSection={<IconInbox size={16} />}>
            Inbox
          </Tabs.Tab>
          <Tabs.Tab value="projects" leftSection={<IconFolder size={16} />}>
            Projects
          </Tabs.Tab>
          <Tabs.Tab value="upcoming" leftSection={<IconCalendarDue size={16} />}>
            Upcoming
          </Tabs.Tab>
          <Tabs.Tab value="recurring" leftSection={<IconRepeat size={16} />}>
            Recurring
          </Tabs.Tab>
          <Tabs.Tab value="labels" leftSection={<IconTags size={16} />}>
            Labels
          </Tabs.Tab>
          <Tabs.Tab value="focus-mode" leftSection={<IconFocusCentered size={16} />}>
            Focus Mode
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard" pt="md">
          <DashboardContent taskSummary={taskSummary} initialTasks={initialTasks} hideHeader />
        </Tabs.Panel>

        <Tabs.Panel value="today" pt="md">
          <TodayContent hideHeader />
        </Tabs.Panel>

        <Tabs.Panel value="inbox" pt="md">
          <InboxContent hideHeader />
        </Tabs.Panel>

        <Tabs.Panel value="projects" pt="md">
          {selectedProjectId ? (
            <ProjectDetailContent
              projectId={selectedProjectId}
              hideHeader
              onBack={() => setSelectedProjectId(null)}
            />
          ) : (
            <ProjectsContent hideHeader onProjectSelect={setSelectedProjectId} />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="upcoming" pt="md">
          <UpcomingContent hideHeader />
        </Tabs.Panel>

        <Tabs.Panel value="recurring" pt="md">
          <RecurringContent hideHeader />
        </Tabs.Panel>

        <Tabs.Panel value="labels" pt="md">
          <LabelsContent hideHeader />
        </Tabs.Panel>

        <Tabs.Panel value="focus-mode" pt="md">
          <FeaturePlaceholder
            title="Focus Mode"
            description="Deep work without distractions"
            icon={IconFocusCentered}
          />
        </Tabs.Panel>
      </Tabs>

      {showCreate && (
        <TaskFormModal onClose={() => setShowCreate(false)} />
      )}
    </Stack>
  );
}

"use client";

import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Stack, Title, Group, Button, Tabs, Skeleton } from "@mantine/core";
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
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";
import { TaskFormModal } from "@/modules/tasks/components/TaskFormModal";

const DashboardContent = lazy(() => import("./DashboardContent").then(m => ({ default: m.DashboardContent })));
const TodayContent = lazy(() => import("./today/TodayContent").then(m => ({ default: m.TodayContent })));
const InboxContent = lazy(() => import("./inbox/InboxContent").then(m => ({ default: m.InboxContent })));
const ProjectsContent = lazy(() => import("./projects/ProjectsContent").then(m => ({ default: m.ProjectsContent })));
const ProjectDetailContent = lazy(() => import("./projects/ProjectDetailContent").then(m => ({ default: m.ProjectDetailContent })));
const UpcomingContent = lazy(() => import("./upcoming/UpcomingContent").then(m => ({ default: m.UpcomingContent })));
const RecurringContent = lazy(() => import("./recurring/RecurringContent").then(m => ({ default: m.RecurringContent })));
const LabelsContent = lazy(() => import("./labels/LabelsContent").then(m => ({ default: m.LabelsContent })));

type Props = {
  taskSummary?: any;
  initialTasks?: any[];
  defaultTab?: string;
};

function TabFallback() {
  return (
    <Stack gap="md">
      <Skeleton height={40} width={300} />
      <Skeleton height={140} />
      <Skeleton height={320} />
    </Stack>
  );
}

export function TasksContent({ taskSummary, initialTasks, defaultTab = "dashboard" }: Props) {
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
      window.history.replaceState(null, "", `/tasks${params.toString() ? `?${params}` : ""}`);
    }
  }, [searchParams]);

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
      window.history.replaceState(null, "", `/tasks${qs ? `?${qs}` : ""}`);
    },
    [searchParams],
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
          <Suspense fallback={<TabFallback />}>
            <DashboardContent taskSummary={taskSummary} initialTasks={initialTasks} hideHeader />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="today" pt="md">
          <Suspense fallback={<TabFallback />}>
            <TodayContent hideHeader />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="inbox" pt="md">
          <Suspense fallback={<TabFallback />}>
            <InboxContent hideHeader />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="projects" pt="md">
          <Suspense fallback={<TabFallback />}>
            {selectedProjectId ? (
              <ProjectDetailContent
                projectId={selectedProjectId}
                hideHeader
                onBack={() => setSelectedProjectId(null)}
              />
            ) : (
              <ProjectsContent hideHeader onProjectSelect={setSelectedProjectId} />
            )}
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="upcoming" pt="md">
          <Suspense fallback={<TabFallback />}>
            <UpcomingContent hideHeader />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="recurring" pt="md">
          <Suspense fallback={<TabFallback />}>
            <RecurringContent hideHeader />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="labels" pt="md">
          <Suspense fallback={<TabFallback />}>
            <LabelsContent hideHeader />
          </Suspense>
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

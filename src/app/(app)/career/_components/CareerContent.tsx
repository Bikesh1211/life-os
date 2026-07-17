"use client";

import { useCallback, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, Skeleton, Stack, Container, Title } from "@mantine/core";
import {
  IconBriefcase,
  IconFileDescription,
  IconSend,
  IconMicrophone,
  IconCertificate,
  IconChartBar,
  IconCoin,
  IconUser,
} from "@tabler/icons-react";

const DashboardTab = lazy(() => import("./DashboardTab"));
const ProfileTab = lazy(() => import("./ProfileTab"));
const ResumesTab = lazy(() => import("./ResumesTab"));
const ApplicationsTab = lazy(() => import("./ApplicationsTab"));
const InterviewPrepTab = lazy(() => import("./InterviewPrepTab"));
const CertificationsTab = lazy(() => import("./CertificationsTab"));
const SalaryTab = lazy(() => import("./SalaryTab"));

const tabs = [
  { value: "dashboard", label: "Dashboard", icon: IconChartBar },
  { value: "profile", label: "Profile", icon: IconUser },
  { value: "resumes", label: "Resumes", icon: IconFileDescription },
  { value: "applications", label: "Applications", icon: IconSend },
  { value: "interviews", label: "Interviews", icon: IconMicrophone },
  { value: "certifications", label: "Certifications", icon: IconCertificate },
  { value: "salary", label: "Salary", icon: IconCoin },
];

function TabFallback() {
  return (
    <Stack gap="md">
      <Skeleton height={40} width={300} />
      <Skeleton height={140} />
      <Skeleton height={320} />
    </Stack>
  );
}

export function CareerContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "dashboard";

  const handleTabChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      const params = new URLSearchParams(searchParams.toString());
      if (value === "dashboard") {
        params.delete("tab");
      } else {
        params.set("tab", value);
      }
      const qs = params.toString();
      window.history.replaceState(null, "", `/career${qs ? `?${qs}` : ""}`);
    },
    [searchParams],
  );

  return (
    <Container size="xl" py="md">
      <Title order={2} mb="lg">
        Career OS
      </Title>

      <Tabs value={activeTab} onChange={handleTabChange} keepMounted={false}>
        <Tabs.List mb="lg">
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon size={18} />}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value="dashboard">
          <Suspense fallback={<TabFallback />}>
            <DashboardTab />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="profile">
          <Suspense fallback={<TabFallback />}>
            <ProfileTab />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="resumes">
          <Suspense fallback={<TabFallback />}>
            <ResumesTab />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="applications">
          <Suspense fallback={<TabFallback />}>
            <ApplicationsTab />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="interviews">
          <Suspense fallback={<TabFallback />}>
            <InterviewPrepTab />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="certifications">
          <Suspense fallback={<TabFallback />}>
            <CertificationsTab />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="salary">
          <Suspense fallback={<TabFallback />}>
            <SalaryTab />
          </Suspense>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}

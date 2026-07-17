"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Stack, Tabs, Skeleton } from "@mantine/core";
import { IconDeviceTv, IconArticle, IconBrandBlogger, IconVideo, IconFilePencil } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

const LibraryContent = lazy(() => import("@/modules/books/components/library/LibraryContent").then(m => ({ default: m.LibraryContent })));

type Props = {
  defaultTab?: string;
};

const tabs = [
  { value: "overview", label: "Overview", icon: IconDeviceTv },
  { value: "articles", label: "Articles", icon: IconArticle },
  { value: "blog-posts", label: "Blog Posts", icon: IconBrandBlogger },
  { value: "vlog-scripts", label: "Vlog Scripts", icon: IconVideo },
  { value: "books", label: "Books", icon: IconFilePencil },
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

export function CreatorStudioContent({ defaultTab = "overview" }: Props) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string | null>(
    searchParams.get("tab") ?? defaultTab,
  );

  const handleTabChange = useCallback(
    (value: string | null) => {
      setActiveTab(value);
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "overview") {
        params.set("tab", value);
      } else {
        params.delete("tab");
      }
      const qs = params.toString();
      window.history.replaceState(null, "", `/creator-studio${qs ? `?${qs}` : ""}`);
    },
    [searchParams],
  );

  return (
    <Stack gap="md">
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon size={18} />}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <Suspense fallback={<TabFallback />}>
            <FeaturePlaceholder title="Creator Studio" description="Write articles, blog posts, vlog scripts and books" icon={IconDeviceTv} />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="articles" pt="md">
          <Suspense fallback={<TabFallback />}>
            <FeaturePlaceholder title="Articles" description="Write and manage articles" icon={IconArticle} />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="blog-posts" pt="md">
          <Suspense fallback={<TabFallback />}>
            <FeaturePlaceholder title="Blog Posts" description="Manage your blog posts" icon={IconBrandBlogger} />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="vlog-scripts" pt="md">
          <Suspense fallback={<TabFallback />}>
            <FeaturePlaceholder title="Vlog Scripts" description="Create video scripts" icon={IconVideo} />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="books" pt="md">
          <Suspense fallback={<TabFallback />}>
            <LibraryContent />
          </Suspense>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stack, Tabs } from "@mantine/core";
import { IconDeviceTv, IconArticle, IconBrandBlogger, IconVideo, IconFilePencil } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";
import { LibraryContent } from "@/modules/books/components/library/LibraryContent";

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

export function CreatorStudioContent({ defaultTab = "overview" }: Props) {
  const router = useRouter();
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
      router.replace(`/creator-studio${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams],
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
          <FeaturePlaceholder title="Creator Studio" description="Write articles, blog posts, vlog scripts and books" icon={IconDeviceTv} />
        </Tabs.Panel>

        <Tabs.Panel value="articles" pt="md">
          <FeaturePlaceholder title="Articles" description="Write and manage articles" icon={IconArticle} />
        </Tabs.Panel>

        <Tabs.Panel value="blog-posts" pt="md">
          <FeaturePlaceholder title="Blog Posts" description="Manage your blog posts" icon={IconBrandBlogger} />
        </Tabs.Panel>

        <Tabs.Panel value="vlog-scripts" pt="md">
          <FeaturePlaceholder title="Vlog Scripts" description="Create video scripts" icon={IconVideo} />
        </Tabs.Panel>

        <Tabs.Panel value="books" pt="md">
          <LibraryContent />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

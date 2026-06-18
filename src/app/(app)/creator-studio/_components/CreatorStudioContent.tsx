"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "@mantine/core";
import { IconDeviceTv, IconArticle, IconBrandBlogger, IconVideo } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

const tabs = [
  { value: "articles", label: "Articles", icon: IconArticle },
  { value: "blog-posts", label: "Blog Posts", icon: IconBrandBlogger },
  { value: "vlog-scripts", label: "Vlog Scripts", icon: IconVideo },
];

export function CreatorStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "articles";

  const handleTabChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      const params = new URLSearchParams(searchParams.toString());
      if (value === "articles") {
        params.delete("tab");
      } else {
        params.set("tab", value);
      }
      const qs = params.toString();
      router.replace(`/creator-studio${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <Tabs value={activeTab} onChange={handleTabChange} keepMounted={false}>
      <Tabs.List mb="lg">
        {tabs.map((tab) => (
          <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon size={18} />}>
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <Tabs.Panel value="articles">
        <FeaturePlaceholder title="Articles" description="Write and manage articles" icon={IconArticle} />
      </Tabs.Panel>
      <Tabs.Panel value="blog-posts">
        <FeaturePlaceholder title="Blog Posts" description="Manage your blog posts" icon={IconBrandBlogger} />
      </Tabs.Panel>
      <Tabs.Panel value="vlog-scripts">
        <FeaturePlaceholder title="Vlog Scripts" description="Create video scripts" icon={IconVideo} />
      </Tabs.Panel>
    </Tabs>
  );
}

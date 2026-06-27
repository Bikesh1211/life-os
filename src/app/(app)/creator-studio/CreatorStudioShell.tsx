"use client";

import { Tabs } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import {
  IconDeviceTv, IconArticle, IconBrandBlogger, IconVideo, IconFilePencil,
} from "@tabler/icons-react";

const tabs = [
  { value: "/creator-studio", label: "Overview", icon: IconDeviceTv },
  { value: "/creator-studio/articles", label: "Articles", icon: IconArticle },
  { value: "/creator-studio/blog-posts", label: "Blog Posts", icon: IconBrandBlogger },
  { value: "/creator-studio/vlog-scripts", label: "Vlog Scripts", icon: IconVideo },
  { value: "/creator-studio/books", label: "Books", icon: IconFilePencil },
];

export function CreatorStudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = tabs.find(
    (t) => pathname === t.value || pathname.startsWith(t.value + "/"),
  )?.value ?? "/creator-studio";

  const showTabs = !pathname.match(/\/creator-studio\/books\/[^/]+\/(write|read)/);

  return (
    <>
      {showTabs && (
        <Tabs value={currentTab} onChange={(value) => value && router.push(value)}>
          <Tabs.List mb="lg">
            {tabs.map((tab) => (
              <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon size={18} />}>
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
      )}
      {children}
    </>
  );
}

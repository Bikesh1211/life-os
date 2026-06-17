"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@mantine/core";
import type { EditorProps } from "./types";

const EditorInner = dynamic(() => import("./Editor").then((m) => m.Editor), {
  ssr: false,
  loading: () => (
    <Skeleton height={250} radius="md" />
  ),
});

export function Editor(props: EditorProps) {
  return <EditorInner {...props} />;
}

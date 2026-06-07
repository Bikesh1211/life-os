"use client";

import { useState, type KeyboardEvent } from "react";
import { Group, Text, CloseButton, TextInput } from "@mantine/core";
import { cn } from "@/core/utils";

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
};

export function TagInput({ value, onChange, placeholder = "Add a tag..." }: TagInputProps) {
  const [input, setInput] = useState("");

  function addTag(tag: string) {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div>
      <Group gap={4} mb={4}>
        {value.map((tag) => (
          <span
            key={tag}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
              "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
            )}
          >
            {tag}
            <CloseButton
              size="xs"
              variant="transparent"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
            />
          </span>
        ))}
      </Group>
      <TextInput
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length > 0 ? "Add another..." : placeholder}
        size="xs"
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SimpleGrid, Text, Group, Button, Modal, TextInput, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconQuote, IconPlus, IconTrash } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { SectionHeading } from "@/modules/movies/components/design-system/SectionHeading";
import { apiFetch } from "@/core/api/http";

export function QuotesContent() {
  const [opened, { open, close }] = useDisclosure(false);
  const [quote, setQuote] = useState("");
  const [character, setCharacter] = useState("");
  const [personalMeaning, setPersonalMeaning] = useState("");
  const queryClient = useQueryClient();

  const { data: quotes } = useQuery({
    queryKey: ["movie-quotes"],
    queryFn: () => apiFetch<any[]>("/api/movies/quotes"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      apiFetch("/api/movies/quotes", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      notifications.show({ title: "Created", message: "Quote saved", color: "green" });
      queryClient.invalidateQueries({ queryKey: ["movie-quotes"] });
      close(); setQuote(""); setCharacter(""); setPersonalMeaning("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/movies/quotes/${id}`, { method: "DELETE" }),
    onSuccess: () => { notifications.show({ title: "Deleted", message: "Quote deleted", color: "orange" }); queryClient.invalidateQueries({ queryKey: ["movie-quotes"] }); },
  });

  return (
    <div>
      <SectionHeading
        title="Quotes"
        icon={<IconQuote size={18} />}
        action={<Button leftSection={<IconPlus size={16} />} size="sm" onClick={open}>Add Quote</Button>}
      />

      {quotes && quotes.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {quotes.map((q: any) => (
            <div key={q.id} className="relative rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
              <Text size="sm" fs="italic" c="white" style={{ lineHeight: 1.6 }}>
                "{q.quote}"
              </Text>
              {q.character && <Text size="xs" c="dimmed" mt={2}>— {q.character}</Text>}
              {q.personalMeaning && (
                <Text size="xs" c="dimmed" mt={2} className="border-t border-[var(--border-subtle)] pt-2">
                  💭 {q.personalMeaning}
                </Text>
              )}
              <button
                onClick={() => deleteMutation.mutate(q.id)}
                className="absolute right-2 top-2 rounded-full p-1 text-[var(--mantine-color-dimmed)] opacity-0 transition-all hover:bg-[var(--mantine-color-dark-4)] hover:text-red-400 group-hover:opacity-100"
              >
                <IconTrash size={14} />
              </button>
            </div>
          ))}
        </SimpleGrid>
      ) : (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-4 text-5xl">💬</div>
          <Text size="sm" c="dimmed">No quotes yet. Save your favorite movie quotes!</Text>
        </div>
      )}

      <Modal opened={opened} onClose={close} title="Add Quote" size="md">
        <div className="space-y-4">
          <Textarea label="Quote" placeholder="We used to look up at the sky..." value={quote} onChange={(e) => setQuote(e.currentTarget.value)} required minRows={3} />
          <TextInput label="Character" placeholder="Cooper" value={character} onChange={(e) => setCharacter(e.currentTarget.value)} />
          <Textarea label="Personal Meaning" placeholder="This quote motivates me to dream bigger." value={personalMeaning} onChange={(e) => setPersonalMeaning(e.currentTarget.value)} minRows={2} />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={close}>Cancel</Button>
            <Button onClick={() => createMutation.mutate({ quote, character, personalMeaning })} loading={createMutation.isPending} disabled={!quote.trim()}>Save</Button>
          </Group>
        </div>
      </Modal>
    </div>
  );
}

import { getCurrentUserId } from "@/core/auth";
import { getUpcomingBirthdays, getConnections } from "@/modules/network";
import { Container, Title, Card, Group, Text, Stack, ThemeIcon } from "@mantine/core";
import { IconCake } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

function calculateAge(birthday: string): number {
  const today = new Date();
  const birth = new Date(birthday);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function daysUntil(birthday: string): number {
  const today = new Date();
  const birth = new Date(birthday);
  const next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < today) next.setFullYear(next.getFullYear() + 1);
  return Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function zodiac(birthday: string): string {
  const d = new Date(birthday);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return "Aries";
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return "Taurus";
  if ((m === 5 && day >= 21) || (m === 6 && day === 20)) return "Gemini";
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return "Cancer";
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return "Leo";
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return "Virgo";
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return "Libra";
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return "Scorpio";
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return "Sagittarius";
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return "Capricorn";
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

export default async function BirthdaysPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const [birthdays, connections] = await Promise.all([
    getUpcomingBirthdays(userId),
    getConnections(userId),
  ]);

  const allWithBirthdays = connections.filter((c) => c.birthday).sort((a, b) => {
    return daysUntil(a.birthday!) - daysUntil(b.birthday!);
  });

  if (allWithBirthdays.length === 0) {
    return (
      <Container size="xl">
        <FeaturePlaceholder title="Birthdays" description="Add birthdays to your connections to see them here" icon={IconCake} />
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Birthdays</Title>
      <Stack>
        {allWithBirthdays.map((c) => {
          const age = calculateAge(c.birthday!);
          const turning = age + 1;
          const days = daysUntil(c.birthday!);
          const sign = zodiac(c.birthday!);
          return (
            <Card key={c.id} withBorder padding="md" radius="md">
              <Group>
                <ThemeIcon variant="light" color="pink" size="xl" radius="xl">
                  <IconCake size={24} />
                </ThemeIcon>
                <Stack gap={0} style={{ flex: 1 }}>
                  <Text fw={500}>{c.name}</Text>
                  <Text size="sm" c="dimmed">
                    {c.birthday} — Turning {turning} ({sign})
                  </Text>
                </Stack>
                <Text fw={700} size="lg" c={days <= 7 ? "red" : "dimmed"}>
                  {days === 0 ? "Today!" : `${days} days`}
                </Text>
              </Group>
            </Card>
          );
        })}
      </Stack>
    </Container>
  );
}

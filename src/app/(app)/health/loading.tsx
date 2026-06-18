import { Center, Loader, Stack, Text } from "@mantine/core";

export default function HealthLoading() {
  return (
    <Center h="60vh">
      <Stack align="center" gap="sm">
        <Loader size="lg" />
        <Text size="sm" c="dimmed">Loading health data...</Text>
      </Stack>
    </Center>
  );
}

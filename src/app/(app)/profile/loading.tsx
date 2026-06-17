import { Stack, Skeleton } from "@mantine/core";

export default function ProfileLoading() {
  return (
    <Stack gap="md" align="center">
      <Skeleton height={100} width={100} radius="50%" />
      <Skeleton height={24} width={160} />
      <Skeleton height={14} width={200} />
      <Skeleton height={300} width="100%" radius="md" />
    </Stack>
  );
}

import { HabitsContent } from "./HabitsContent";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function HabitsPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  return <HabitsContent defaultTab={tab ?? "dashboard"} />;
}

import { getCurrentUserId } from "@/core/auth";
import { getProgram, getProgramDaysWithExercises } from "@/modules/fitness";
import { ProgramDetailContent } from "./ProgramDetailContent";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProgramDetailPage({ params }: Props) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { id } = await params;
  const [program, days] = await Promise.all([
    getProgram(id, userId),
    getProgramDaysWithExercises(id),
  ]);

  if (!program) return null;

  return <ProgramDetailContent program={program} days={days} />;
}

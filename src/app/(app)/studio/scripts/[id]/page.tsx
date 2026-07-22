import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ScriptDetailPage({ params }: Props) {
  const { id } = await params;
  redirect(`/studio/scripts/${id}/write`);
}

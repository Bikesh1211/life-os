import { ProjectDetailContent } from "../ProjectDetailContent";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <ProjectDetailContent projectId={id} />;
}

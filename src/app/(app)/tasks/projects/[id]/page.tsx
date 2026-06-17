import { ProjectDetailContent } from "../ProjectDetailContent";

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <ProjectDetailContent projectId={id} />;
}

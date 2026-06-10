import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getEntryLinks, addEntryLink, deleteEntryLink, createLinkSchema } from "@/modules/knowledge";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const links = await getEntryLinks(id, userId);
  return NextResponse.json(links);
}

export async function POST(request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = createLinkSchema.parse(body);
    const link = await addEntryLink(id, userId, parsed);
    if (!link) {
      return NextResponse.json(
        { error: "Entry or linked entry not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get("linkId");
    if (!linkId) {
      return NextResponse.json(
        { error: "linkId query parameter is required" },
        { status: 400 },
      );
    }
    const deleted = await deleteEntryLink(linkId, userId);
    if (!deleted) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete link" },
      { status: 500 },
    );
  }
}

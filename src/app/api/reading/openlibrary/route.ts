import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { lookupByIsbn, searchByTitle } from "@/modules/reading";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const isbn = searchParams.get("isbn");
    const title = searchParams.get("title");

    if (isbn) {
      const book = await lookupByIsbn(isbn);
      if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(book);
    }

    if (title) {
      const books = await searchByTitle(title);
      return NextResponse.json(books);
    }

    return NextResponse.json({ error: "Provide isbn or title" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

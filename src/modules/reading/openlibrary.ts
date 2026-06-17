const OPENLIBRARY_BASE = "https://openlibrary.org";

export type OpenLibraryBook = {
  title: string;
  subtitle?: string;
  authors: string[];
  isbn: string;
  isbn10?: string;
  isbn13?: string;
  publisher?: string;
  publishedYear?: number;
  pageCount?: number;
  coverUrl?: string;
  description?: string;
};

export async function lookupByIsbn(isbn: string): Promise<OpenLibraryBook | null> {
  const clean = isbn.replace(/[-\s]/g, "");
  if (!/^\d{10,13}$/.test(clean)) return null;

  try {
    const res = await fetch(`${OPENLIBRARY_BASE}/isbn/${clean}.json`);
    if (!res.ok) return null;
    const data = await res.json() as Record<string, unknown>;

    const works = data.works as Array<Record<string, unknown>> | undefined;
    const worksKey = works?.[0]?.key as string | undefined;
    let description: string | undefined;

    if (worksKey) {
      const workRes = await fetch(`${OPENLIBRARY_BASE}${worksKey}.json`);
      if (workRes.ok) {
        const workData = await workRes.json() as Record<string, unknown>;
        const desc = workData.description;
        description = typeof desc === "string" ? desc : (desc as Record<string, string>)?.value;
      }
    }

    const identifiers = data.identifiers as Record<string, string[]> | undefined;
    const isbn13 = identifiers?.isbn_13?.[0];
    const isbn10 = identifiers?.isbn_10?.[0];

    return {
      title: data.title as string,
      subtitle: data.subtitle as string | undefined,
      authors: ((data.authors as Array<Record<string, unknown>>) ?? [])
        .map((a) => (a.name ?? a.key) as string),
      isbn: clean,
      isbn10,
      isbn13,
      publisher: (data.publishers as string[])?.[0],
      publishedYear: data.publish_date
        ? parseInt((data.publish_date as string).match(/\d{4}/)?.[0] ?? "", 10)
        : undefined,
      pageCount: data.number_of_pages as number | undefined,
      coverUrl: `https://covers.openlibrary.org/b/isbn/${clean}-L.jpg`,
      description,
    };
  } catch {
    return null;
  }
}

export async function searchByTitle(query: string): Promise<OpenLibraryBook[]> {
  try {
    const res = await fetch(
      `${OPENLIBRARY_BASE}/search.json?q=${encodeURIComponent(query)}&limit=10`,
    );
    if (!res.ok) return [];
    const data = await res.json() as { docs: Array<Record<string, unknown>> };
    return (data.docs ?? []).map((doc) => ({
      title: (doc.title as string) ?? "",
      subtitle: doc.subtitle as string | undefined,
      authors: (doc.author_name as string[]) ?? [],
      isbn: ((doc.isbn as string[])?.[0]) ?? "",
      isbn10: (doc.isbn as string[])?.[0],
      isbn13: (doc.isbn as string[])?.[1],
      publisher: (doc.publisher as string[])?.[0],
      publishedYear: doc.first_publish_year as number | undefined,
      pageCount: doc.number_of_pages_median as number | undefined,
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : ((doc.isbn as string[])?.[0]
            ? `https://covers.openlibrary.org/b/isbn/${(doc.isbn as string[])[0]}-L.jpg`
            : undefined),
      description: doc.description as string | undefined,
    }));
  } catch {
    return [];
  }
}

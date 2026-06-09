const COVER_ART_BASE = "https://coverartarchive.org";

export async function getCoverArtUrl(
  releaseGroupMbid: string,
  size: "small" | "large" = "large",
): Promise<string | null> {
  try {
    const res = await fetch(
      `${COVER_ART_BASE}/release-group/${releaseGroupMbid}/front-${size === "large" ? "500" : "250"}`,
      { method: "HEAD" },
    );
    if (res.ok) {
      return `${COVER_ART_BASE}/release-group/${releaseGroupMbid}/front-${size === "large" ? "500" : "250"}`;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getCoverArtUrlByRelease(releaseMbid: string): Promise<string | null> {
  try {
    const res = await fetch(`${COVER_ART_BASE}/release/${releaseMbid}/front`, {
      method: "HEAD",
    });
    if (res.ok) {
      return `${COVER_ART_BASE}/release/${releaseMbid}/front`;
    }
    return null;
  } catch {
    return null;
  }
}

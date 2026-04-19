import type { SupabaseClient } from "@supabase/supabase-js";

export type SubmissionCoverPickRow = {
  project_id: string;
  public_url: string;
  vote_count: number;
  created_at: string;
};

function parseSubmissionCoverRow(r: Record<string, unknown>): SubmissionCoverPickRow | null {
  const project_id = typeof r.project_id === "string" ? r.project_id : "";
  const public_url = typeof r.public_url === "string" ? r.public_url : "";
  if (!project_id || !public_url) return null;
  const vote_count = typeof r.vote_count === "number" ? r.vote_count : Number(r.vote_count ?? 0) || 0;
  const created_at =
    typeof r.created_at === "string"
      ? r.created_at
      : r.created_at instanceof Date
        ? r.created_at.toISOString()
        : new Date().toISOString();
  return { project_id, public_url, vote_count, created_at };
}

/** Highest vote_count; ties broken by newest created_at. */
export function pickWinningSubmissionCover(rows: SubmissionCoverPickRow[]): string | undefined {
  if (rows.length === 0) return undefined;
  const best = rows.reduce((a, b) => {
    if (b.vote_count !== a.vote_count) return b.vote_count > a.vote_count ? b : a;
    return new Date(b.created_at).getTime() > new Date(a.created_at).getTime() ? b : a;
  });
  return best.public_url;
}

export function winningSubmissionCoverUrlByProjectId(
  rows: SubmissionCoverPickRow[],
): Map<string, string> {
  const byProject = new Map<string, SubmissionCoverPickRow[]>();
  for (const row of rows) {
    const list = byProject.get(row.project_id);
    if (list) list.push(row);
    else byProject.set(row.project_id, [row]);
  }
  const out = new Map<string, string>();
  for (const [projectId, list] of byProject) {
    const url = pickWinningSubmissionCover(list);
    if (url) out.set(projectId, url);
  }
  return out;
}

export async function fetchWinningSubmissionCoverUrlByProjectId(
  supabase: SupabaseClient,
  projectIds: string[],
): Promise<Map<string, string>> {
  if (projectIds.length === 0) return new Map();
  const { data, error } = await supabase
    .from("submissions")
    .select("project_id, public_url, vote_count, created_at")
    .in("project_id", projectIds);
  if (error || !data?.length) return new Map();
  const parsed: SubmissionCoverPickRow[] = [];
  for (const raw of data) {
    const row = parseSubmissionCoverRow(raw as Record<string, unknown>);
    if (row) parsed.push(row);
  }
  return winningSubmissionCoverUrlByProjectId(parsed);
}

export function overlayWinningSubmissionCovers<T extends { id: string; coverImageUrl: string }>(
  projects: T[],
  urlByProjectId: Map<string, string>,
): T[] {
  return projects.map((p) => {
    const url = urlByProjectId.get(p.id);
    return url ? { ...p, coverImageUrl: url } : p;
  });
}

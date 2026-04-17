export interface VideoComment {
  id: string;
  videoId: string;
  author: string;
  body: string;
  up: number;
  down: number;
  createdAt: number;
}

const COMMENTS_KEY = "tmack48_comments_v1";
const ADMIN_CONFIG_KEY = "tmack48_admin_config_v1";
const METRICS_KEY = "tmack48_metrics_v1";

export interface AdminConfig {
  heroVideoId?: string;
  heroTitle?: string;
  heroBio?: string;
  paypalUrl?: string;
}

interface MetricsState {
  visits: number;
  commentCount: number;
}

const safeParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const isBrowser = typeof window !== "undefined";

export const loadComments = (): VideoComment[] => {
  if (!isBrowser) return [];
  return safeParse<VideoComment[]>(window.localStorage.getItem(COMMENTS_KEY), []);
};

export const saveComments = (comments: VideoComment[]) => {
  if (!isBrowser) return;
  window.localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
};

export const addComment = (videoId: string, author: string, body: string) => {
  const comments = loadComments();
  const next: VideoComment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    videoId,
    author: author.trim() || "Anonymous",
    body: body.trim(),
    up: 0,
    down: 0,
    createdAt: Date.now(),
  };
  const all = [next, ...comments];
  saveComments(all);
  bumpMetrics({ commentCount: all.length });
  return all;
};

export const voteComment = (commentId: string, type: "up" | "down") => {
  const next = loadComments().map((c) =>
    c.id === commentId ? { ...c, [type]: c[type] + 1 } : c
  );
  saveComments(next);
  return next;
};

export const deleteComment = (commentId: string) => {
  const next = loadComments().filter((c) => c.id !== commentId);
  saveComments(next);
  bumpMetrics({ commentCount: next.length });
  return next;
};

export const loadAdminConfig = (): AdminConfig => {
  if (!isBrowser) return {};
  return safeParse<AdminConfig>(window.localStorage.getItem(ADMIN_CONFIG_KEY), {});
};

export const saveAdminConfig = (cfg: AdminConfig) => {
  if (!isBrowser) return;
  window.localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(cfg));
};

export const getMetrics = (): MetricsState => {
  if (!isBrowser) return { visits: 0, commentCount: 0 };
  return safeParse<MetricsState>(window.localStorage.getItem(METRICS_KEY), {
    visits: 0,
    commentCount: loadComments().length,
  });
};

export const bumpMetrics = (patch: Partial<MetricsState>) => {
  const merged = { ...getMetrics(), ...patch };
  if (isBrowser) {
    window.localStorage.setItem(METRICS_KEY, JSON.stringify(merged));
  }
  return merged;
};

import { useEffect, useState } from "react";
import { videos as staticVideos, type Video } from "@/data/videos";
import { fetchLiveStats, fetchLiveVideos, type LiveStats } from "@/lib/youtube";

export function useVideos(): { videos: Video[]; loading: boolean; source: "api" | "fallback" } {
  const [videos, setVideos] = useState<Video[]>(staticVideos);
  const [loading, setLoading] = useState<boolean>(true);
  const [source, setSource] = useState<"api" | "fallback">("fallback");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const live = await fetchLiveVideos();
        if (cancelled) return;
        if (live !== staticVideos) {
          setVideos(live);
          setSource("api");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { videos, loading, source };
}

export function useChannelStats(): { stats: LiveStats; loading: boolean } {
  const [stats, setStats] = useState<LiveStats>({ source: "fallback" });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await fetchLiveStats();
      if (!cancelled) {
        setStats(s);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return { stats, loading };
}

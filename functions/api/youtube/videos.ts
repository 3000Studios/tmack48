interface Env {
  YOUTUBE_API_KEY?: string;
  YOUTUBE_CHANNEL_ID?: string;
}

interface YTSearchItem {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    publishedAt?: string;
    thumbnails?: {
      default?: { url?: string };
      medium?: { url?: string };
      high?: { url?: string };
      maxres?: { url?: string };
    };
  };
}

interface YTSearchResponse {
  items?: YTSearchItem[];
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const key = env.YOUTUBE_API_KEY;
  const channelId = env.YOUTUBE_CHANNEL_ID ?? "UCoshH9Hn9nCEC0z8BS6WdIQ";

  if (!key) return json({ videos: [] }, 200); // graceful: client falls back to static

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("key", key);
    url.searchParams.set("channelId", channelId);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("order", "date");
    url.searchParams.set("maxResults", "30");
    url.searchParams.set("type", "video");

    const res = await fetch(url.toString(), {
      cf: { cacheEverything: true, cacheTtl: 900 },
    });
    if (!res.ok) return json({ videos: [] }, 200);

    const data = (await res.json()) as YTSearchResponse;
    const videos = (data.items ?? [])
      .filter((it) => it.id?.videoId)
      .map((it) => ({
        videoId: it.id!.videoId!,
        title: it.snippet?.title ?? "",
        thumbnailUrl: it.snippet?.thumbnails?.medium?.url,
        thumbnailHqUrl: it.snippet?.thumbnails?.high?.url,
        thumbnailMaxUrl: it.snippet?.thumbnails?.maxres?.url ?? it.snippet?.thumbnails?.high?.url,
      }));

    return json({ videos }, 200, { "Cache-Control": "public, max-age=600, s-maxage=900" });
  } catch {
    return json({ videos: [] }, 200);
  }
};

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      ...extra,
    },
  });
}

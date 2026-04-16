interface Env {
  YOUTUBE_API_KEY?: string;
  YOUTUBE_CHANNEL_ID?: string;
}

interface YTChannelsResponse {
  items?: Array<{
    statistics?: {
      viewCount?: string;
      subscriberCount?: string;
      videoCount?: string;
    };
  }>;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const key = env.YOUTUBE_API_KEY;
  const channelId = env.YOUTUBE_CHANNEL_ID ?? "UCoshH9Hn9nCEC0z8BS6WdIQ";
  if (!key) return json({ source: "fallback" });

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/channels");
    url.searchParams.set("key", key);
    url.searchParams.set("id", channelId);
    url.searchParams.set("part", "statistics");

    const res = await fetch(url.toString(), {
      cf: { cacheEverything: true, cacheTtl: 900 },
    });
    if (!res.ok) return json({ source: "fallback" });

    const data = (await res.json()) as YTChannelsResponse;
    const stats = data.items?.[0]?.statistics;
    if (!stats) return json({ source: "fallback" });
    return json(
      {
        subscribers: stats.subscriberCount,
        views: stats.viewCount,
        videoCount: stats.videoCount,
        source: "api",
      },
      200,
      { "Cache-Control": "public, max-age=1800, s-maxage=3600" }
    );
  } catch {
    return json({ source: "fallback" });
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

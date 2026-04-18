/** Mirrors `functions/api/stories.ts` payloads for the client bundle. */
export interface StoryPayload {
  edition: number;
  title: string;
  excerpt: string;
  body: string;
  videoUrl: string;
  mediaCredit: string;
  publishedAt: string;
  canonicalPath: string;
  canonicalUrl: string;
}

export interface StoryFeedResponse {
  latestEdition: number;
  generatedHourUtc: string;
  stories: StoryPayload[];
}

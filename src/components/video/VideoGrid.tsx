import type { Video } from "@/data/videos";
import VideoCard from "./VideoCard";

interface Props {
  videos: Video[];
  onOpen?: (v: Video) => void;
  className?: string;
}

export default function VideoGrid({ videos, onOpen, className = "" }: Props) {
  if (!videos.length) {
    return (
      <div className="glass rounded-3xl p-10 text-center text-platinum/70">
        No videos match this filter yet. Check back soon — new drops coming.
      </div>
    );
  }
  return (
    <div
      className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
    >
      {videos.map((v, i) => (
        <VideoCard key={v.id} video={v} onOpen={onOpen} priority={i < 3} />
      ))}
    </div>
  );
}

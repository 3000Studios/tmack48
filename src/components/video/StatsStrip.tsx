import { useChannelStats } from "@/hooks/useVideos";
import { formatNumber } from "@/lib/utils";
import Reveal from "@/components/effects/Reveal";
import { DiamondIcon, SparkleIcon, StarIcon, YoutubeIcon } from "@/components/ui/Icon";
import { siteConfig } from "@/data/siteConfig";

export default function StatsStrip({ count }: { count: number }) {
  const { stats } = useChannelStats();

  const items = [
    {
      label: "Videos",
      value: stats.videoCount ? formatNumber(Number(stats.videoCount)) : String(count),
      Icon: YoutubeIcon,
    },
    {
      label: "Subscribers",
      value: stats.subscribers ? formatNumber(Number(stats.subscribers)) : siteConfig.stats.fans,
      Icon: StarIcon,
    },
    {
      label: "Total Views",
      value: stats.views ? formatNumber(Number(stats.views)) : siteConfig.stats.moves,
      Icon: DiamondIcon,
    },
    { label: "Energy", value: "∞", Icon: SparkleIcon },
  ];

  return (
    <section className="section">
      <Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div key={it.label} className="card-premium p-6 text-center hover-lift">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full glass-gold text-gold-300 mb-3">
                <it.Icon className="h-6 w-6" />
              </div>
              <div className="display-title text-3xl font-black gold-text">{it.value}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.3em] text-platinum/60">{it.label}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

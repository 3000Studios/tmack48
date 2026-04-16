import { Link } from "react-router-dom";
import Seo from "@/components/ui/Seo";
import AmbientParticles from "@/components/effects/AmbientParticles";
import { ArrowRightIcon, YoutubeIcon } from "@/components/ui/Icon";
import { siteConfig } from "@/data/siteConfig";

export default function NotFound() {
  return (
    <>
      <Seo path="/404" title="404 — Not Found" description="This page is off the grid." />
      <section className="relative isolate min-h-[70dvh] grid place-items-center overflow-hidden">
        <AmbientParticles count={60} className="opacity-40" />
        <div className="container-lux text-center">
          <p className="eyebrow">404</p>
          <h1 className="mt-3 display-title text-7xl sm:text-9xl font-black">
            <span className="gold-text">Off the Grid</span>
          </h1>
          <p className="mt-5 mx-auto max-w-xl text-platinum/80 text-lg">
            This page isn't part of the TMACK48 universe — yet. Let's get you back to the action.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/" className="btn-gold">
              Back to Home <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <a
              href={siteConfig.channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              <YoutubeIcon className="h-5 w-5" /> YouTube Channel
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

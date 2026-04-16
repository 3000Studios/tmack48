import Seo from "@/components/ui/Seo";
import Gallery from "@/components/gallery/Gallery";
import Reveal from "@/components/effects/Reveal";
import SupportCta from "@/components/support/SupportCta";

export default function GalleryPage() {
  return (
    <>
      <Seo
        path="/gallery"
        title="Gallery"
        description="Visual moments from the TMACK48 universe — premium stills and cinematic frames."
      />

      <header className="container-lux pt-16 pb-6">
        <span className="eyebrow">Visual Diary</span>
        <h1 className="mt-2 display-title text-5xl sm:text-6xl lg:text-7xl font-black">
          <span className="diamond-text">Gallery</span>
        </h1>
        <p className="mt-4 max-w-2xl text-platinum/75 text-lg">
          Curated frames and cinematic stills from the TMACK48 universe.
        </p>
      </header>

      <section className="container-lux py-10">
        <Reveal>
          <Gallery />
        </Reveal>
      </section>

      <SupportCta />
    </>
  );
}

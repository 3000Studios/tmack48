import Seo from "@/components/ui/Seo";
import Reveal from "@/components/effects/Reveal";
import Newsletter from "@/components/support/Newsletter";
import AmbientParticles from "@/components/effects/AmbientParticles";
import { upcomingEvents, pastEvents, hasEvents, type ResolvedEvent } from "@/data/events";
import { siteConfig } from "@/data/siteConfig";
import { ArrowRightIcon } from "@/components/ui/Icon";

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
const fmtTime = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

function EventRow({ e }: { e: ResolvedEvent }) {
  return (
    <div className="card-premium flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-5">
        <div className="text-center">
          <div className="text-2xl font-black text-gold-300">{e.start.getDate()}</div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-platinum/60">
            {e.start.toLocaleDateString("en-US", { month: "short" })}
          </div>
        </div>
        <div>
          <h3 className="display-title text-lg font-bold text-platinum">{e.title}</h3>
          <p className="text-sm text-platinum/70">
            {e.venue} · {e.city}
            {e.country ? `, ${e.country}` : ""}
          </p>
          <p className="text-xs text-platinum/50">
            {fmtDate(e.start)} · {fmtTime(e.start)}
          </p>
        </div>
      </div>
      {e.ticketUrl ? (
        <a href={e.ticketUrl} target="_blank" rel="noopener noreferrer" className="btn-gold whitespace-nowrap">
          {e.status === "sold-out" ? "Sold out" : "Get tickets"} <ArrowRightIcon className="h-4 w-4" />
        </a>
      ) : (
        <span className="text-xs uppercase tracking-[0.25em] text-platinum/50">
          {e.status === "sold-out" ? "Sold out" : "On sale soon"}
        </span>
      )}
    </div>
  );
}

export default function Tour() {
  const eventSchema = upcomingEvents.map((e) => ({
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: e.title,
    startDate: e.start.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: e.venue,
      address: [e.city, e.country].filter(Boolean).join(", "),
    },
    performer: { "@type": "MusicGroup", name: "TMACK48", url: siteConfig.url },
    ...(e.ticketUrl ? { offers: { "@type": "Offer", url: e.ticketUrl } } : {}),
  }));

  return (
    <>
      <Seo
        path="/tour"
        title="Tour & Events"
        description="TMACK48 live dates and events. Get notified the moment a show is announced."
        schema={eventSchema.length ? { "@context": "https://schema.org", "@graph": eventSchema } : undefined}
      />

      <section className="relative isolate overflow-hidden">
        <AmbientParticles className="opacity-30" count={40} />
        <header className="container-lux pt-16 pb-8">
          <Reveal>
            <span className="eyebrow">Live</span>
            <h1 className="mt-2 display-title text-5xl sm:text-6xl lg:text-7xl font-black">
              <span className="gold-text">Tour &amp; Events</span>
            </h1>
            <p className="mt-4 max-w-2xl text-platinum/80 text-lg">
              Where the universe goes live. Real dates only — get on the list and you'll know the second
              a show drops.
            </p>
          </Reveal>
        </header>
      </section>

      <section className="container-lux pb-16">
        {hasEvents ? (
          <div className="space-y-10">
            {upcomingEvents.length > 0 && (
              <div>
                <h2 className="display-title text-2xl font-black text-platinum mb-5">Upcoming</h2>
                <div className="space-y-4">
                  {upcomingEvents.map((e) => (
                    <Reveal key={e.id}>
                      <EventRow e={e} />
                    </Reveal>
                  ))}
                </div>
              </div>
            )}
            {pastEvents.length > 0 && (
              <div>
                <h2 className="display-title text-2xl font-black text-platinum mb-5">Past shows</h2>
                <div className="space-y-4 opacity-70">
                  {pastEvents.map((e) => (
                    <EventRow key={e.id} e={e} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Reveal>
            <div className="card-premium p-10 text-center sm:p-16">
              <h2 className="display-title text-3xl font-black text-platinum">No dates announced — yet</h2>
              <p className="mx-auto mt-4 max-w-xl text-platinum/75">
                The next move is being planned. Be first to know when TMACK48 hits a stage near you —
                join the list and we'll send the dates straight to your inbox.
              </p>
              <div className="mx-auto mt-8 max-w-xl">
                <Newsletter variant="inline" source="tour-waitlist" />
              </div>
            </div>
          </Reveal>
        )}
      </section>

      {hasEvents && (
        <section className="container-lux pb-24">
          <Newsletter source="tour" />
        </section>
      )}
    </>
  );
}

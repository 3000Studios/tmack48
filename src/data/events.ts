import { slugify } from "@/lib/slug";

/**
 * Tour / events. EMPTY by default on purpose — do NOT invent dates, venues, or cities.
 * Add real, confirmed shows to EVENTS below and they will appear automatically with
 * schema.org/MusicEvent markup and a "notify me" fallback when nothing is scheduled.
 */
export interface TourEvent {
  /** ISO date (e.g. "2026-08-14T20:00:00-05:00"). Real dates only. */
  date: string;
  title: string;
  venue: string;
  city: string;
  country?: string;
  /** Ticket / RSVP link. Leave blank if not on sale yet. */
  ticketUrl?: string;
  status?: "on-sale" | "sold-out" | "announced";
}

export interface ResolvedEvent extends TourEvent {
  id: string;
  start: Date;
  isUpcoming: boolean;
}

const EVENTS: TourEvent[] = [
  // {
  //   date: "2026-08-14T20:00:00-05:00",
  //   title: "TMACK48 Live",
  //   venue: "The Venue Name",
  //   city: "City",
  //   country: "USA",
  //   ticketUrl: "https://...",
  //   status: "announced",
  // },
];

function resolve(e: TourEvent): ResolvedEvent {
  const start = new Date(e.date);
  return {
    ...e,
    id: `${slugify(e.title)}-${slugify(e.city)}-${e.date.slice(0, 10)}`,
    start,
    isUpcoming: start.getTime() >= Date.now(),
  };
}

export const allEvents: ResolvedEvent[] = EVENTS.map(resolve).sort(
  (a, b) => a.start.getTime() - b.start.getTime()
);

export const upcomingEvents = allEvents.filter((e) => e.isUpcoming);
export const pastEvents = allEvents.filter((e) => !e.isUpcoming).reverse();
export const hasEvents = allEvents.length > 0;

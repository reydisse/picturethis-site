import { getCollection, type CollectionEntry } from "astro:content";

export type SiteEvent = CollectionEntry<"events">;
/** Badge text: whose event this is. */
export function hostLabel(host: string, hostName?: string): string {
  if (host === "picturethis") return "PictureThis";
  const kind = host === "partner" ? "Partner" : "Community";
  return hostName ? `${kind} · ${hostName}` : `${kind} event`;
}

/** Who runs it, in words: the host's name, or a neutral fallback. */
export function hostName(event: SiteEvent): string {
  const { host, hostName } = event.data;
  return host === "picturethis" ? "PictureThis Production" : hostName || "its organiser";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function publishedEvents(): Promise<SiteEvent[]> {
  const events = await getCollection("events", ({ data }) => !data.draft);
  return events.sort((a, b) => sortKey(a).localeCompare(sortKey(b)) || a.data.title.localeCompare(b.data.title));
}

/** Exact dates first, then month-only, then events still waiting for a date. */
export function sortKey(event: SiteEvent): string {
  const { start, month } = event.data;
  return start ? start.toISOString().slice(0, 10) : month ? `${month}-99` : "9999-99-99";
}

/** Last day the event runs, as YYYY-MM-DD; undefined while the date is unknown. */
export function lastDay(event: SiteEvent): string | undefined {
  const { start, end, month } = event.data;
  if (end ?? start) return (end ?? start)!.toISOString().slice(0, 10);
  if (month) return `${month}-31`;
  return undefined;
}

export function isPast(event: SiteEvent, today = new Date().toISOString().slice(0, 10)): boolean {
  const last = lastDay(event);
  return last !== undefined && last < today;
}

/** Month the event falls in, for the list headings: key YYYY-MM (or "tbc") and a label. */
export function monthGroup(event: SiteEvent): { key: string; label: string } {
  const { start, month } = event.data;
  const key = start ? start.toISOString().slice(0, 7) : month ?? "tbc";
  if (key === "tbc") return { key, label: "Date to be confirmed" };
  const [year, m] = key.split("-").map(Number);
  const label = new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString("en-CA", { month: "long", year: "numeric", timeZone: "UTC" });
  return { key, label };
}

/** The big date tile: day and month when fixed, month only, or "TBC". */
export function dateTile(event: SiteEvent): { top: string; big: string; bottom: string } {
  const { start, month } = event.data;
  if (start) return { top: MONTHS[start.getUTCMonth()], big: String(start.getUTCDate()), bottom: String(start.getUTCFullYear()) };
  if (month) {
    const [year, m] = month.split("-");
    return { top: "From", big: MONTHS[Number(m) - 1], bottom: year };
  }
  return { top: "Date", big: "TBC", bottom: "Soon" };
}

/** All-day calendar file for events with a fixed date. */
export function icsHref(event: SiteEvent, siteUrl: string): string | undefined {
  const { start, end, title, summary, location } = event.data;
  if (!start) return undefined;
  const day = (d: Date) => d.toISOString().slice(0, 10).replaceAll("-", "");
  const after = new Date((end ?? start).getTime() + 86_400_000);
  const esc = (s: string) => s.replace(/[\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PictureThis Production//Events//EN", "BEGIN:VEVENT",
    `UID:${event.id}@picturethis-production.com`, `DTSTAMP:${day(new Date())}T000000Z`,
    `DTSTART;VALUE=DATE:${day(start)}`, `DTEND;VALUE=DATE:${day(after)}`,
    `SUMMARY:${esc(title)}`, `DESCRIPTION:${esc(`${summary}\n${siteUrl}/events/${event.id}/`)}`, `LOCATION:${esc(location)}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

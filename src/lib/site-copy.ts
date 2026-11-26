import site from "../data/site.json";

/**
 * The cohort wording lives in src/data/site.json (editable in Pages CMS) but appears inside many
 * design files. These are the wordings as written in those designs; at build time each is
 * swapped for the current setting, so one edit updates every page.
 */
const DESIGN_WORDING = {
  announcementLead: "January cohort · Applications open.",
  announcementDetail: "Twenty free places, Saturdays 10:00 AM–2:00 PM.",
  cohortLine: "January cohort · Twenty places · Saturdays 10:00 AM–2:00 PM",
  applyFor: "Apply for the January cohort",
  openTo: "The January cohort is open to anyone on this list",
  applications: "Applications are open for January.",
};

const escapeHtml = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export function applySiteCopy(html: string): string {
  const swaps: [string, string][] = [
    [DESIGN_WORDING.announcementLead, site.announcement.lead],
    [DESIGN_WORDING.announcementDetail, site.announcement.detail],
    [DESIGN_WORDING.cohortLine, site.cohort.line],
    [DESIGN_WORDING.applyFor, `Apply for the ${site.cohort.name}`],
    [DESIGN_WORDING.openTo, `The ${site.cohort.name} is open to anyone on this list`],
    [DESIGN_WORDING.applications, site.cohort.applications],
  ];
  let out = html;
  for (const [from, to] of swaps) if (from !== to) out = out.replaceAll(from, escapeHtml(to));
  return out;
}

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Pages CMS saves empty optional fields as "" (or null). Treat those as "not set".
const blank = (value: unknown) => value === '' || value === null ? undefined : value;
const optional = <T extends z.ZodTypeAny>(schema: T) => z.preprocess(blank, schema.optional());
const optionalDate = optional(z.coerce.date());
const optionalText = optional(z.string());

const collection = (name: string) => defineCollection({
  loader: glob({ pattern: '**/*.md', base: `./src/content/${name}` }),
  schema: z.object({
    title: z.string(),
    draft: z.boolean().default(true),
    summary: optionalText,
    date: optionalDate,
    author: optionalText,
    photo: optionalText,
    photo_caption: optionalText,
    pull_quote: optionalText,
    type: optionalText,
    status: optionalText,
    status_note: optionalText,
  }),
});

// Events drive the Events page selector. `host`: "picturethis" (ours), "partner" (an organisation we
// work with) or "community" (a community event we amplify, run independently by `hostName`).
// Give `start` (YYYY-MM-DD) once a date is fixed; until then `month` (YYYY-MM) orders it.
const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    draft: z.boolean().default(true),
    host: z.enum(['picturethis', 'partner', 'community']),
    hostName: optionalText,
    format: z.string(),
    summary: z.string(),
    start: optionalDate,
    end: optionalDate,
    month: optional(z.string().regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM, for example 2027-01')),
    dateLabel: z.string(),
    time: optionalText,
    location: z.string(),
    cost: optionalText,
    places: optionalText,
    audience: optionalText,
    // A button needs both a label and a link; a half-filled one is ignored.
    cta: z.preprocess(
      (value) => value && typeof value === 'object' && (value as { label?: string }).label && (value as { href?: string }).href ? value : undefined,
      z.object({ label: z.string(), href: z.string() }).optional(),
    ),
    photo: optionalText,
  }),
});

export const collections = { blog: collection('blog'), projects: collection('projects'), events, partners: collection('partners') };

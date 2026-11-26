import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const collection = (name: string) => defineCollection({loader:glob({pattern:'**/*.md',base:`./src/content/${name}`}),schema:z.object({title:z.string(),draft:z.boolean().default(true),summary:z.string().optional(),date:z.coerce.date().optional(),author:z.string().optional(),photo:z.string().optional(),photo_caption:z.string().optional(),pull_quote:z.string().optional(),type:z.string().optional(),status:z.string().optional(),status_note:z.string().optional()})});
// Events drive the Events page selector. `host`: "picturethis" (ours), "partner" (an organisation we
// work with) or "community" (a community event we amplify, run independently by `hostName`).
// Give `start` (YYYY-MM-DD) once a date is fixed; until then `month` (YYYY-MM) orders it.
const events = defineCollection({loader:glob({pattern:'**/*.md',base:'./src/content/events'}),schema:z.object({
  title:z.string(),
  draft:z.boolean().default(true),
  host:z.enum(['picturethis','partner','community']),
  hostName:z.string().default('PictureThis Production'),
  format:z.string(),
  summary:z.string(),
  start:z.coerce.date().optional(),
  end:z.coerce.date().optional(),
  month:z.string().regex(/^\d{4}-\d{2}$/).optional(),
  dateLabel:z.string(),
  time:z.string().optional(),
  location:z.string(),
  cost:z.string().optional(),
  places:z.string().optional(),
  audience:z.string().optional(),
  cta:z.object({label:z.string(),href:z.string()}).optional(),
  photo:z.string().optional(),
})});
export const collections = {blog:collection('blog'),projects:collection('projects'),events,partners:collection('partners')};

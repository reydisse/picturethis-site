import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const collection = (name: string) => defineCollection({loader:glob({pattern:'**/*.md',base:`./src/content/${name}`}),schema:z.object({title:z.string(),draft:z.boolean().default(true),summary:z.string().optional(),date:z.coerce.date().optional(),author:z.string().optional(),photo:z.string().optional(),photo_caption:z.string().optional(),pull_quote:z.string().optional(),type:z.string().optional(),status:z.string().optional(),status_note:z.string().optional()})});
export const collections = {blog:collection('blog'),projects:collection('projects'),events:collection('events'),partners:collection('partners')};

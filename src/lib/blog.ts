import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

/** Published posts, newest first (title order breaks ties on the same day). */
export async function publishedPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort((a, b) =>
    (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0) || a.data.title.localeCompare(b.data.title));
}

export function formatDate(date?: Date): string | undefined {
  return date?.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

/** Whole minutes at roughly 220 words a minute, from the Markdown source. */
export function readingMinutes(post: Post): number {
  const words = (post.body ?? "").replace(/<[^>]+>|[#*_>\[\]()`]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

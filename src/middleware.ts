import { defineMiddleware } from "astro:middleware";
import { applySiteCopy } from "./lib/site-copy";

// Runs while each page is built: applies the Site settings wording (see src/lib/site-copy.ts).
export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (!response.headers.get("content-type")?.includes("text/html")) return response;
  const html = applySiteCopy(await response.text());
  return new Response(html, { status: response.status, statusText: response.statusText, headers: response.headers });
});

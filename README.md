# PictureThis Production

Run `npm install` and `npm run build`. Static output is `dist/`. Deploy with `wrangler pages deploy dist --project-name picturethis-site --branch main`.

## Editorial workflow

Chief drafts from program notes and photos. The editorial lead approves every article; merging the PR publishes through a manual build/deploy. Cadence follows cohort starts, show recaps, mentor spotlights and graduate milestones.

## Pre-launch actions

- Swap the real contact email in `src/config.ts` (the single placeholder value).
- Connect a form service using `formEndpoint` in the same config.
- Decide on CanadaHelps or Zeffy; no payment processing is installed.
- Supply consented real photos to replace captioned stock photography.

## Outstanding implementation

Blog Markdown generation, the three full launch draft files, Markdown-driven projects/events/partners, the complete curriculum table and exact foundation-copy fidelity require completion. Current pages are static Astro templates. Do not treat this repository as the completed brief.

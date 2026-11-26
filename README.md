# PictureThis Production

Run `npm install` and `npm run build`. Static output is `dist/`. Deploy with `wrangler pages deploy dist --project-name picturethis-site --branch main`.

## Settings

All in `src/config.ts`:

- `contactEmail`: the inbox shown on the site and used by every form.
- `formEndpoint`: where forms deliver. It uses FormSubmit, which forwards each submission to `contactEmail`. FormSubmit asks that inbox to confirm once, on the first submission it receives.
- `donationUrl`: the Zeffy donation page. While it is empty, `/donate/` shows a pledge form (nothing is charged; you follow up by email). Once you set it, `/donate/` shows a "Donate online" button and the gift cards link to Zeffy.

## Editorial workflow

Chief drafts from program notes and photos. Rey approves every article; merging the PR publishes through a manual build/deploy. Cadence follows cohort starts, show recaps, mentor spotlights and graduate milestones.

Blog posts and projects are Markdown files in `src/content/`. A post is published when its front matter has `draft: false`.

## Before launch

- Send one test enquiry from the live site and confirm the FormSubmit activation email.
- Set `donationUrl` when Zeffy is ready.
- Supply consented real photos to replace the illustrative stock photography.

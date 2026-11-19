# Live fidelity gate — 2026-11-19

Implementation commit: a900d92. Pushed main, then Wrangler direct production upload (`npx wrangler pages deploy dist --project-name picturethis-site --branch main`). Deployment: https://9646d0d6.picturethis-site.pages.dev . DNS and custom-domain settings untouched.

Live stylesheet changed from civic.ivG9SyPe.css to civic.CCOk4T4V.css on both production hosts. Fresh full-page Chromium captures overwrite home-1440.png and home-390.png. Measured document width equals viewport at 1440, 390 and 375. Build passes. Checked https://picturethis-site.pages.dev/ , https://picturethis-production.com/ , https://picturethis-site.pages.dev/programs/ and https://picturethis-site.pages.dev/faithfire/ (200). Evidence: results.json.

Gate: PARTIAL, not a pixel-identical frame match. Composition implemented; frozen copy and available photographs constrain fidelity.

| Section | Verdict | Reason |
| --- | --- | --- |
| Masthead/nav | partial | Existing navigation preserved; frozen links differ from draft frame. |
| Hero | partial | Split stage retained; long frozen vision/mission increases height. |
| Cohort strip | match | Blue horizontal desktop strip retained, stacked mobile. |
| Why we exist | partial | Photo left, story and exact existing vision/mission sentences right, bold leads, six numbered beliefs in three columns; frozen story length increases height. |
| Equipment photos | partial | Existing two-image interlude preserved. |
| Program | partial | Large existing Programs headline, numbered rows and wide photo/pale companion panel; Pathways frozen paragraph substitutes for absent craft paragraph. |
| What comes next | match | Sound desk left in blue band, two numbered management items right. |
| Standards | partial | Photo left, heading and ruled standards right; available control-desk photograph substitutes for headphones/crew essentials. Full Faithfire story retained, increasing height. |
| Testimonial | partial | Pale band retained; full Veronica quotation is longer than draft. |
| Get involved | partial | White three-column layout retained; frozen combined partner/donate wording. |
| Before you join | partial | Two numbered FAQ rows use existing frozen answers; missed-session row omitted because no frozen answer was found. |
| Closing | partial | Pale split closing and disabled non-sending preview preserved; frozen January heading. |
| Footer | partial | Blue footer preserved with existing links and nonprofit wording. |

No draft testimonial or hero copy imported. Photos remain colour, captions Illustrative photography. Pathways paragraph appears once, inside Program companion panel. FAQ equipment sentence comes verbatim from src/content/blog/eight-weeks-real-gear.md; cost and experience answers reuse existing Home sentences. No new answer invented. Other page source files unchanged; new composition selectors target Home classes.

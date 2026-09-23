# Lahlou Crafted

Design and build the webapp for Lahlou Workers, a Moroccan construction and skilled-workforce company. Language: French.

THE BRIEF

Lahlou supplies skilled crews and builds for developers, contractors and private clients across Morocco. The site should make them feel like the most serious, reliable name in the trade: confident, precise, proud of the people who do the work. The homepage needs to earn trust fast and lead to one action: requesting a crew or a quote.

DIRECTION

Think editorial architecture studio rather than construction company website. Light, calm and spacious, with strong typography doing the heavy lifting and real photography of crews and sites. Every detail should feel intentional, as if a senior designer drew it by hand on a layout grid. The attached screenshots are a quality bar, not a template: match their polish and pacing, then push further with your own composition, sharper type and more considered details. Don't copy their layout or style.

NON-NEGOTIABLES

- Colors, nothing else: background #F9F9F9, text #0A0A0A, secondary #8A8A8A, hairlines #D4D4D4, dark accents #0A0A0A / #141414 / #1F1F1F used sparingly, and one accent, Lahlou Red #BF1014 (hover #9A0C10, tint #FBE9E9).

- The site is mostly light. Dark is a rare moment, not a theme.

- Red follows the logo's logic: one red letter in "lahlou workers", so one red moment per section, never more.

- Type: Archivo (heavy) for display, Manrope for everything else.

- Sharp corners. Structure through whitespace and 1px hairlines, not cards or shadows.

- Motion is slow and weighted. Include thoughtful scroll interactions like the references (sticky storytelling, a draggable carousel, a gallery moment), but choose where they serve the story.

WHAT THE PAGE SHOULD COVER

Who Lahlou is, proof in numbers, the trades they offer, selected projects, how working with them goes, what clients say, common questions, and a strong closing call to action with contact details and WhatsApp.

AVOID

Anything that looks AI-generated or templated: gradients, glassmorphism, rounded cards, pill buttons, emoji, icons in colored circles, centered hero with three feature cards, generic SaaS patterns.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fe24933e-88c3-4a22-ade3-bd33e3f38c9d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
cp .env.example .env   # fill in Supabase + SMTP + admin secrets
npm run dev
```

## Production (Vercel + Supabase + Nodemailer)

Company identity is centralized in `src/lib/site.ts` (sourced from
[Charika](https://www.charika.ma/societe-lahlou-workers-1144714),
[Tachrone](https://tachrone.ma/fr/profil/lahlou-workers/4672),
[LinkedIn](https://www.linkedin.com/company/lahlou-workersconstruction/) and
[Instagram](https://www.instagram.com/lahlou.workers/)).

1. **Supabase**: create a project, run `supabase/schema.sql` in the SQL editor,
   create a public bucket `project-images` (see comments at the bottom of the schema).
2. **Env**: copy `.env.example` to Vercel env vars:
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server only, never `VITE_`),
   `ADMIN_PASSWORD_HASH` (generate: `node -e "console.log(require('bcryptjs').hashSync(' strong-password', 12))"`),
   `ADMIN_SESSION_SECRET` (32+ random chars), `SMTP_*` / `MAIL_*` (e.g. Gmail app password),
   `VITE_WHATSAPP_NUMBER` + `PUBLIC_WHATSAPP_NUMBER` once the real number is known
   (Tachrone hides it behind login — WhatsApp button falls back to `/contact` until set).
3. **Deploy**: push to `main` (Vercel builds with `vite build`, nitro auto-targets `vercel`;
   security headers in `vercel.json`). CI (`.github/workflows/ci.yml`) runs
   `tsc --noEmit` + `eslint` + `vite build`.
4. **Admin**: single admin at `/admin/login` (HttpOnly signed cookie, 12 h).
   All `list*/delete*` server functions require the session; public writes are
   zod-validated, rate-limited, honeypot-protected, and trigger a Nodemailer
   notification to `MAIL_TO`.
5. **SEO/GEO/AEO**: `lang="fr"`, canonical + OG/Twitter + geo meta, JSON-LD
   (GeneralContractor + WebSite + FAQ), `sitemap.xml`, `robots.txt`
   (`Disallow: /admin`), `manifest.webmanifest`, `llms.txt` for AI answers.

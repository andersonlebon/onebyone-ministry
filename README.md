# One By One Ministries Website

Professional, SEO-optimized ministry website for One By One Ministries built with the roadmap stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vercel-ready deployment
- SEO metadata, sitemap, robots, OpenGraph, and structured data
- Responsive Home, About, Projects, Gallery, Get Involved, and Contact pages

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

## Environment variables

Copy `.env.example` to `.env.local` for local configuration.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical domain used by metadata, sitemap, robots, and OpenGraph URLs. |
| `CONTACT_FORM_WEBHOOK_URL` | Optional server-side webhook endpoint for contact form delivery. Configure this in Vercel before launch. |

## Content workflow

Most editable ministry content lives in `src/lib/site.ts`, including navigation, social links, project summaries, gallery cards, involvement options, testimonials, and contact details.

Replace placeholder SVGs in `public/images/gallery` with approved ministry photos or optimized image assets as content is collected. Keep testimony and people-centered content consent-based before publishing.

## Deployment notes

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Set `NEXT_PUBLIC_SITE_URL` to `https://www.onebyoneministries.org`.
4. Configure `CONTACT_FORM_WEBHOOK_URL` if using the built-in form endpoint.
5. Connect the custom domain, then verify Google Search Console and analytics.

## Database reset (development only)

`npm run db:reset` and `npm run db:reset:all` wipe tables, media storage, and optionally auth users. **Never run these against production** without a backup. Production targets are blocked by default; see [scripts/PRODUCTION.md](scripts/PRODUCTION.md).

## Map 4 You

Map 4 You is a trip companion web app built with Next.js App Router.

## Development

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Travel Data Strategy

The public browse flow currently uses a free-first provider setup:

- GeoDB Cities for live city discovery by country
- Built-in major city directory as the fallback discovery layer when GeoDB is unavailable
- Google Places for destination imagery and nearby points of interest
- Unsplash as a fallback image source when Google Places is not configured
- Curated local fallback data for seeded destinations

## Environment Setup

Create `.env.local` from `.env.example`:

```bash
copy .env.example .env.local
```

Then add your provider keys:

```bash
GEODB_API_KEY=your_key_here
GOOGLE_PLACES_API_KEY=your_key_here
UNSPLASH_ACCESS_KEY=your_key_here
```

Optional defaults already exist in `.env.example` for the endpoint and host.

Without a GeoDB key, supported countries still render a built-in set of major cities, and Google Places is used to enrich those destinations with photos and nearby recommendations when configured.

Without a Google Places key, the app falls back to Unsplash for photos and to lightweight generated recommendation cards for live destinations.

Google Places setup:

1. Create or select a Google Cloud project.
2. Enable Places API (New).
3. Attach billing to the project.
4. Create an API key restricted to Places API and your server environment.
5. Add the key as `GOOGLE_PLACES_API_KEY` in `.env.local`.

## Validation

Run lint checks with:

```bash
npm run lint
```

## Notes

- `.env.local` is gitignored.
- Design reference exports live in `references/` and are not shipped.
- Runtime assets live in `public/`.

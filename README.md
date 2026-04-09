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

The public browse flow currently uses a curated local catalog:

- Three countries are available in the browse surface: Francia, Italia y España
- Each country exposes six hand-picked city cards
- Only Paris and Madrid currently have full destination detail pages enabled
- City imagery is served from local assets in `public/France`, `public/Italy` and `public/Spain`
- The rest of the cards stay visible as upcoming destinations while the catalog is expanded

## Environment Setup

Create `.env.local` from `.env.example`:

```bash
copy .env.example .env.local
```

Then add provider keys only if you want to experiment with live enrichment or enable the chatbot:

```bash
GEODB_API_KEY=your_key_here
GOOGLE_PLACES_API_KEY=your_key_here
UNSPLASH_ACCESS_KEY=your_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your_key_here
AZURE_OPENAI_DEPLOYMENT=map4you-chat
AZURE_OPENAI_API_VERSION=2024-10-21
```

Optional defaults already exist in `.env.example` for the endpoint and host.

The default browsing experience no longer depends on GeoDB, Google Places, or Unsplash.

The chatbot uses a curated FAQ knowledge source stored in the repo. If Azure chat credentials are missing, the UI still works and falls back to a small local rules-based helper for common questions.

If you decide to re-enable live providers later, treat them as optional enrichment only and put budget alerts and key restrictions in place first.

## Validation

Run lint checks with:

```bash
npm run lint
```

## Notes

- `.env.local` is gitignored.
- Design reference exports live in `references/` and are not shipped.
- Runtime assets live in `public/`.

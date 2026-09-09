# Soft Life Academy — Website

A React + Vite website implementing the Academy learner flow, calling the
same FastAPI backend as `backend/`. Built as an independent web frontend
alongside the existing Expo/React Native app in `frontend/` (both target
the same API — this one isn't a replacement, it's a second surface).

## What's here

```
src/
  theme.css              Brand tokens as CSS custom properties (mirrors frontend/academy/theme.ts)
  types.ts                 TS types mirroring the backend response schemas (identical to the RN app's)
  api/academyApi.ts         Fetch client for the /academy/* endpoints
  auth/session.ts            Placeholder for the real SLS website's auth (getAuthToken / getCurrentUserProfile)
  components/
    CourseCard.tsx            Cream card, gold price tag / blush progress bar
    LessonListItem.tsx         Ink text on ivory, gold when completed, blush when current
    ProgressBar.tsx
    RecommendedNextCard.tsx    Rose accent badge
  pages/
    HomePage.tsx               Dashboard: Continue card, catalog, workbook shortcut
    CourseDetailPage.tsx       Module/lesson list, progress bar, enroll CTA
    LessonPlayerPage.tsx       Ink background, <video> playback, mark-complete/auto-advance
    WorkbookPage.tsx           Cover, description, format tags, download, "Inside" contents
    CertificatePage.tsx        Certificate card (learner name/date), Save/Share, upsell card
  App.tsx                   Routes (react-router-dom)
  main.tsx                  Entry point
```

Ported from the same Academy learner-flow design canvas as the mobile app
(`frontend/academy/`) — same 5 screens, same brand tokens, same API calls,
just HTML/CSS instead of React Native primitives.

## Routes

```
/                                        Home
/courses/:slug                           Course detail (by slug, matches the public API)
/courses/:courseId/lessons/:lessonId     Lesson player
/courses/:courseId/workbook              Workbook
/courses/:courseId/certificate           Certificate (?recommended=<courseId> optional)
```

## Integration into the main SLS website

1. Copy `web/` into the main site's source tree (or mount it as a
   sub-app/micro-frontend under an `/academy` path — the routes above are
   relative, so this works either way).
2. Delete `src/auth/session.ts` — point `academyApi.ts`'s import at the
   real site's auth (session cookie, auth context, or token store).
3. Set `VITE_API_BASE_URL` (see `.env.example`) to the real backend's
   origin, or swap it for however the main site already configures its
   API base URL.
4. Swap the CSS custom properties in `theme.css` for the site's real
   design-token source if one already exists.
5. If mounting as a section of a larger site rather than its own app,
   replace `BrowserRouter` in `main.tsx` with the host app's router
   (or nest `<App />`'s routes under the host's own `<Routes>`).

## Running locally

```
npm install
cp .env.example .env.local   # point at a running backend, or leave the default
npm run dev
```

`npm run build` type-checks (`tsc --noEmit`) and produces a static
`dist/` bundle.

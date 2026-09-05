# Soft Life Academy — Frontend Module

Expo/React Native screens and components implementing the Academy tab. Built
to be **dropped into the existing Soft Life Society app**, not run standalone
— it has no navigation root or auth of its own.

## What's here

```
academy/
  theme.ts               Design tokens (colors, fonts) — see Integration below
  types.ts                 TS types mirroring the backend response schemas
  api.ts                    Fetch client for the /academy/* endpoints
  components/
    CourseCard.tsx           Cream card, gold price tag / blush progress bar
    LessonListItem.tsx        Ink text on ivory, gold when completed, blush when current
    ProgressBar.tsx
    WorkbookDownloadButton.tsx  Gold fill, ivory text
    RecommendedNextCard.tsx    Rose accent badge
  screens/
    CourseListScreen.tsx      "My Courses" + browse published courses
    CourseDetailScreen.tsx    Module/lesson list, progress bar, enroll CTA
    LessonPlayerScreen.tsx    Ink background, video playback, mark-complete/auto-advance
    CourseCompleteScreen.tsx  Cormorant Garamond headline, upsell card
  navigation/
    AcademyNavigator.tsx      Native-stack wiring the four screens above
config.ts                Placeholder for the app's real API base URL
auth/session.ts           Placeholder for the app's real getAuthToken()
```

## Integration into the main SLS app

1. Copy the `academy/` folder into the main app's source tree.
2. Delete `config.ts` and `auth/session.ts` here — in `academy/api.ts`,
   point the two imports at the app's real config and auth/session modules
   instead.
3. Swap the hex values in `theme.ts` for the app's actual design-token file
   if one already exists, so Academy pulls from the same source of truth
   rather than a parallel copy.
4. Add `AcademyNavigator` as a screen inside the existing tab navigator,
   under an "Academy" tab.
5. Make sure `expo-av`, `expo-web-browser`, `@react-navigation/native`, and
   `@react-navigation/native-stack` are installed at versions compatible
   with the app's Expo SDK (see `package.json` peerDependencies here for
   what this module was written against).
6. Register Cormorant Garamond and DM Sans fonts (via `expo-font` /
   `expo-google-fonts`) if the app doesn't already load them.

## Type-checking

```
npm install --no-save typescript @types/react react react-native expo \
  expo-av expo-web-browser @react-navigation/native @react-navigation/native-stack
npx tsc --noEmit
```

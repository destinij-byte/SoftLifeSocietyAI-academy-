# Soft Life Academy — mobile app

An Expo (React Native + TypeScript) port of the two Claude Design canvas
prototypes: the enrolled-learner flow and the admin course-builder. Every screen,
field, and interaction reproduces the original `.dc.html` prototypes
(`AcademyScreen.dc.html` and `AdminScreen.dc.html`) — this is real, runnable code,
not a mockup.

## Run it

```bash
npm install
npm start
```

Then press `i` (iOS simulator), `a` (Android emulator), or `w` (web) — or scan the
QR code with Expo Go on a physical device.

## What's here

```
App.tsx                       Font loading + providers + navigation root
src/
  theme/colors.ts             The brand palette + type scale, as design tokens
  types.ts                    Course / Module / Lesson / Resource domain types
  data/
    seed.ts                   AUTO-GENERATED real curriculum content (4 courses,
                               53 lessons) — regenerate via the content pipeline,
                               don't hand-edit
    initialCourses.ts         Turns seed.ts into the app's editable course tree
  state/
    AcademyContext.tsx        App state: a reducer over the course tree + learner
                               progress, exposed via useAcademy()
    selectors.ts               Small pure helpers (flatten lessons, % complete, etc.)
    useLearnerVm.ts             The learner-side "view model" hook consumed by all
                               five learner screens
  components/                  Shared UI: buttons, pills, form fields, progress bar,
                               the reorderable admin row, placeholder art
  navigation/                  React Navigation stacks + param lists
  screens/
    learner/                   Home, Course (lesson list), Player, Workbook, Certificate
    admin/                      CoursesList, CourseEditor, ModuleEditor, LessonEditor
```

## Where the prototypes' logic went

The original prototype was one Claude Design canvas component
(`Main.dc.html`'s `class Component extends DCLogic`) holding all state and a set of
`buildXVm()` methods that computed each screen's data on every render. This port
keeps the exact same operations, just expressed idiomatically:

| Prototype | Here |
|---|---|
| `this.state` (mutated in place) | `AcademyContext`'s `useReducer` state (immutable) |
| `buildLearnerVm()` | `useLearnerVm()` hook |
| `buildCoursesVm()` / `buildCourseVm()` / `buildModuleVm()` / `buildLessonVm()` | Read directly from `useAcademy()` context inside each admin screen, since React Navigation now owns the "which screen" state that `adminScreen`/`adminCourseId`/etc. used to track manually |
| `{{ }}` template bindings | JSX |
| `<sc-if>` / `<sc-for>` | ternaries / `.map()` |
| `onClick="{{ vm.onX }}"` handlers | `onPress={() => dispatch(...)}` |

Every reducer action in `AcademyContext.tsx` has a one-line comment pointing back
to the handler it replaces (`onTitleInput`, `onAddModule`, `onUp`/`onDown`,
`onToggleVideo`, etc.) if you want to cross-reference against the original
`AdminScreen.dc.html`.

## Known gaps to fill in before shipping

This is a faithful UI + state port, not a backend. Before this is a real product:

- **Persistence.** `AcademyContext` holds everything in memory — nothing survives
  an app restart. Wire its reducer up to your API/database of choice (the reducer
  actions are already a clean list of "things that can change," which maps well
  onto REST/GraphQL mutations or a sync engine).
- **Auth + roles.** `RootNavigator`'s "Learner app / Course builder" switcher is a
  dev convenience standing in for real role-gating — see the comment at the top of
  `src/navigation/RootNavigator.tsx`.
- **Video playback.** The player screen has a static placeholder where a real
  video component (e.g. `expo-av` or a hosted player SDK) belongs.
- **File uploads.** The course thumbnail, workbook PDF, and lesson video
  "Change"/"Upload" rows are static UI — wire them to your file-picker + storage
  of choice (e.g. `expo-image-picker` / `expo-document-picker` + S3).
- **Fonts.** `App.tsx` loads Cormorant Garamond + DM Sans via
  `@expo-google-fonts/*`; if you'd rather self-host the font files, swap the
  `useFonts` calls for local `.ttf` assets.

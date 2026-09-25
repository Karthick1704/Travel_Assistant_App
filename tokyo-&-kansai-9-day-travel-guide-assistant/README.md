# Tokyo & Kansai — 9-Day Travel Guide Assistant

Personal travel companion for a 9-day journey across Tokyo, Hakone / Mt Fuji, Osaka, Kyoto and the Tango Peninsula. Day-by-day itineraries, an interactive 3D flight deck, route navigation, packing checklists, reviewer insights, etiquette and Japanese phrase audio — installable as a PWA and usable offline.

## Run locally

Prerequisites: Node.js 20+

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` (only needed for the AI guide; the app falls back to offline tips without it)
3. Start: `npm run dev` → http://localhost:3000

Other scripts: `npm run build` (Vite + server bundle), `npm start` (serve `dist/`), `npm run lint` (type check).

## UI architecture

The interface uses an "Ink & Vermilion" design system defined in `src/index.css` (Tailwind v4 `@theme` tokens): a deep-ink hero band, paper-white content cards, a vermilion accent, Cathay jade for flight surfaces and gold for time/countdown elements. Shared primitives live in `src/components/ui/primitives.tsx` (`SectionCard`, `CardHeader`, `Pill`, `Button`, `Segmented`, motion presets).

### Flight deck (3D)

| File | Purpose |
| --- | --- |
| `src/components/three/AircraftScene.tsx` | Procedural Three.js airliner: lathe fuselage with canvas-painted windows/doors/cheatline, swept wings with dihedral and jade winglets, spinning turbofans, jade tail fin with brushwing stroke, retractable landing gear, nav/strobe/beacon lights, shader-based contrails, drifting cloud sprites, star field, PMREM room-environment reflections, `OrbitControls` with auto-orbit. Pauses rendering when off-screen or the tab is hidden. |
| `src/components/BoardingPass3D.tsx` | Pointer-tracked tilt + click-to-flip boarding pass with animated route arc, deterministic barcode and a QR stub; the back shows the flight brief (seat, baggage, transit notes). |
| `src/components/FlightRouteRibbon.tsx` | Animated MAA → HKG → NRT / KIX → HKG → MAA route ribbon with a plane travelling the active arc. |
| `src/components/AirportTicketElement.tsx` | The Flight Deck: direction and leg selectors, 3D/photo stage with phase controls (climb / cruise / descend) and simulated telemetry HUD, boarding pass, route ribbon and brief cards. |
| `src/data/flightsData.ts` | All four Cathay Pacific legs (CX 632, CX 520, CX 503, CX 651). |

The aircraft scene is also used as a live backdrop in the welcome countdown, the top hero band and the Day 1 / Day 9 flight banners.

### Notes

- Telemetry values in the HUD are simulated for ambience, not live flight data.
- Checklist progress is persisted per day in `localStorage`.
- Motion respects `prefers-reduced-motion`.

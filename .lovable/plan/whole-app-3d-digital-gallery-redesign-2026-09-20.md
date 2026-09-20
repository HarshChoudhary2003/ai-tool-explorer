# Whole-App 3D Digital Gallery Redesign

## Goal
Transform the complete AI Tools Explorer into a responsive 3D digital gallery while preserving every current feature, route, filter, admin workflow, and data source.

## Visual direction
- Use a near-black gallery canvas, warm off-white typography, coral primary actions, and mint status accents.
- Switch headings to Instrument Serif and body/interface text to Work Sans.
- Replace the current cyan-purple glass aesthetic, gradient blobs, and oversized rounded panels with restrained exhibition surfaces, thin borders, sharp depth, and editorial spacing.
- Keep both light and dark modes, with the dark gallery as the signature experience and a clean museum-paper light theme.

## Build plan
1. **Create the shared 3D foundation**
   - Add compatible Three.js, React Three Fiber, and Drei packages.
   - Build a reusable full-page 3D gallery environment with sculptural AI forms, controlled lighting, pointer parallax, and route-aware composition.
   - Add graceful static fallbacks for unsupported WebGL, small devices, and reduced-motion preferences.

2. **Unify the whole app shell**
   - Introduce a shared page shell so every route receives the same gallery background, depth layers, typography, spacing, and transitions.
   - Redesign navigation, search entry, mobile menu, theme switcher, and footer in the new exhibition style.
   - Preserve the required “Developed by CodeMeetsData” attribution.

3. **Redesign discovery and browsing**
   - Recompose the homepage as an immersive first viewport with a real-time 3D scene behind the title and search controls.
   - Restyle categories, featured collections, newest tools, ratings, testimonials, FAQs, and process sections as gallery exhibits.
   - Convert tool cards into tactile 3D objects with pointer tilt, layered metadata, lighting response, and keyboard-accessible focus states.
   - Redesign directory filters, mobile filter drawer, pagination, compare selection, loading, and empty states without changing behavior.

4. **Apply the system to every route**
   - Bring category, trending, detail, compare, recommend, submit, blog, article, contact, authentication, dashboard, admin, docs, changelog, privacy, terms, and not-found pages into the same visual system.
   - Use controlled 3D accents on dense working pages so forms, tables, validation reports, and admin controls stay fast and readable.

5. **Motion and interaction polish**
   - Add route entrances, exhibit reveals, subtle camera drift, card depth, and responsive lighting.
   - Keep motion meaningful, disable intensive effects when reduced motion is requested, and avoid layout shift during loading or interaction.

6. **Verification**
   - Verify the homepage, directory, detail page, compare flow, mobile drawer, admin report/import, search modal, and account pages at desktop and mobile sizes.
   - Check WebGL rendering, fallbacks, keyboard navigation, focus visibility, text containment, loading states, and console errors.

## Technical details
- React Three Fiber `^8.18`, Drei `^9.122.0`, and Three.js will match the existing React 18 app.
- The 3D canvas will be shared and fixed behind page content rather than duplicated inside cards.
- CSS perspective and motion will provide lightweight depth for repeated interface elements; WebGL will be reserved for immersive scenes.
- Existing URL state, filtering, sorting, pagination, comparison, search, authentication, and Lovable Cloud operations remain unchanged.

# Thorne Group website — house rules

- This is the Thorne Group website (thornegroup.co.nz), an architectural building company in Tauranga, New Zealand.
- The site is built from self-contained Custom Element .js files in this repo. Never delete or rewrite these existing files without asking.
- Mobile breakpoint is 750px, not 560px.
- Never use translateY in FOUC reveal animations (it breaks position:fixed elements like popups).
- Headings: font-weight 500, size clamp(27px, 3.37vw, 55px). Formatting house standard is thorne-home-page50.js.
- Padding ladder: 56px / 32px / 24px / 20px.
- Labels and captions minimum 14px (audience is 50+).
- Colours: warm white #FAF9F6, warm grey text #393533, mid grey #7a746e, hairline rules #c8c3bb, tinted cards #F2F0ED. Brown accent rules.
- Fonts: DM Sans and Metric. @font-face blocks go in document.head, not the shadow root.
- All copy in NZ English. No em dashes. Short declarative sentences. Never use "dream home", "vision", or luxury cliches.
- Before finishing any visual work, run a Playwright audit at 13 breakpoints from 320px to 1920px.
- The owner (Lisa) is not technical. Explain changes in plain English.

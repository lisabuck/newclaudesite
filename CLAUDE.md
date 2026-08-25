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
- Deployment workflow: push changes to this repo first (Vercel preview at thornesite1234.vercel.app), then WAIT for Lisa to approve the preview before mirroring anything to lisabuck/thorne-group (the live Wix site). Never push to thorne-group without her explicit approval of that change on Vercel.
- Cache busting: every engine script link in the .astro pages carries a version query (e.g. /js/thorne-home-page54.js?v=67, /js/GALLERY6.js?v=23). Whenever an engine's changelog version is bumped, bump its ?v= in every .astro that loads it, in both repos, or the Wix site host serves the hour-old cached copy to returning browsers. Rarely-changed helpers (lightdom-shim, fixlinks, etc.) sit at ?v=1 until edited.
- PRE-LAUNCH SHIELD (temporary): Base.astro carries <meta name="robots" content="noindex, nofollow"> in BOTH repos so nothing is indexed before go-live. When Lisa says thornegroup.co.nz is connected, REMOVE that one line in both repos and republish - robots.txt, sitemap.xml, canonicals and JSON-LD are already in place and need no changes at go-live.
- HIGH PRIORITY (Lisa): do NOT change anything to do with the contact form or the newsletter sign-up. That covers the /contact form (fields, submit handling, form id wiring) and the /newsletter page plus its pinned "Monthly E-Newsletter" button - leave their markup, behaviour and styling alone unless Lisa explicitly asks for a specific change to them. The agency wired real Wix submissions in thorne-group only (thorne-group commit d844132: src/html/thorne-contact.html, src/html/thorne-newsletter.html, src/lib/contact-form.ts, src/pages/api/contact.ts, src/pages/newsletter.astro) - this repo still holds mailto placeholders, so NEVER mirror those files from here to thorne-group.

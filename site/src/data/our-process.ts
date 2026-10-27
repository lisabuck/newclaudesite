/* Our process: the twelve design + build steps, shared by the /our-process
   page and its preview options. Copy is Lisa's (the short "sum" lines are the
   one-line summaries shown before a step is opened). "more" is the full
   detail as HTML, styled by the page that shows it (.dt). */

const W = 'https://static.wixstatic.com/media/';
export const photo = (id: string, w = 640) => `${W}${id}/v1/fit/w_${w},h_${w},q_80,enc_auto/our-process.jpg`;

const p = (t: string) => `<p>${t}</p>`;
const tick = (i: string) => `<li><span class="mk"></span><span>${i}</span></li>`;
const ticks = (items: string[], two = false) =>
  '<ul class="ticks' + (two ? ' two' : '') + '">' + items.map(tick).join('') + '</ul>';

export type Step = { n: number; title: string; sum: string; price?: number; id: string; pos: string; alt: string; more: string };

export const STEPS: Step[] = [
  { n: 1, title: 'Complete the Design Brief', sum: 'Your site, how you want to live, your priorities, style and budget.',
    id: 'b2375c_70854ba20b7d4ce4ae68d390bd3e5cb1~mv2.jpg', pos: '55% 50%', alt: 'A house design on an iPad beside architecture books',
    more: p('We start by understanding the site, how you want to live, your priorities, style, budget and what is most important to you.') + p('This gives us a clear brief to work from before design begins.') },
  { n: 2, title: 'Match the Right Architect or Architectural Designer', sum: 'We recommend the architect or designer best suited to your project.',
    id: 'b2375c_1c8bb5882e124aaa9fb80ee64c5fd9b5~mv2.jpg', pos: '50% 35%', alt: 'Three people looking through designs on an iPad',
    more: p('Based on the brief, we recommend the architect or designer we think is best suited to the project, considering style, budget, site, project complexity and how they work.') + p('There are two ways we can approach this:') +
      '<div class="opts"><div class="opt"><span class="tag">Option A</span><h3>Select one architect</h3><p>We recommend the architect we believe is the best fit and move directly into the concept design process with them.</p></div>' +
      '<div class="opt"><span class="tag">Option B</span><h3>Invite more than one architect to put forward a concept</h3><p>If appropriate, two or more architects could be asked to develop an initial concept for consideration. There would generally be a fee from each architect for this work.</p></div></div>' },
  { n: 3, title: 'Concept / Scheme Design', sum: 'The architect develops the initial concept. We review it together.',
    id: 'b2375c_ae9ee23419f446479ba4a6adaf5bd50f~mv2.jpg', pos: '50% 50%', alt: 'Sketching a floor plan',
    more: p('The selected architect develops the initial concept for the home.') + p('At this stage we review the design with the client and architect, looking at things such as:') +
      ticks(['Overall layout and size', 'How the home sits on the site', 'Buildability', 'Structural complexity', 'Materials', 'Areas that may have a significant impact on cost'], true) },
  { n: 4, title: 'Initial Pricing Review', sum: 'We compare the early design with your budget, before too much design work is done.', price: 1,
    id: 'b2375c_20efe99371704e3f942f240180e49d96~mv2.jpg', pos: '50% 30%', alt: 'Reviewing a 3D design on screen',
    more: p('Once there is enough detail in the scheme, we carry out an initial pricing review.') + p('This is deliberately done early, before too much design work has been completed.') + p('We compare the emerging design with the agreed budget and identify any areas that may need to be reconsidered.') },
  { n: 5, title: 'Client Review', sum: 'You decide if you are happy with the design and the likely investment.',
    id: 'b2375c_c46c6927effa4f0db72de39115f08181~mv2.jpg', pos: '50% 40%', alt: 'Talking through the design at the table',
    more: p('The client then decides whether they are happy with:') +
      '<div class="both"><span>The design</span><span class="plus" aria-hidden="true">+</span><span>The likely level of investment</span></div>' +
      '<div class="outs"><div class="out"><span class="tag">Happy with both</span><p>Move on to design development.</p></div><div class="out"><span class="tag">Changes needed</span><p>The architect, client and Thorne Group work through them together before progressing.</p></div></div>' },
  { n: 6, title: 'Design Development', sum: 'The architect develops the design in more detail.',
    id: 'b2375c_b83542c653a8446394a0a7f9e7b2c29b~mv2.jpg', pos: '40% 50%', alt: 'Detailed drawings in progress',
    more: p('Once the overall concept and budget are aligned, the architect develops the design further.') + p('More detailed decisions are made around construction, materials, specification, interiors and key architectural details.') },
  { n: 7, title: 'Second Pricing Check', sum: 'We price it again as the design develops, before the plans go to consent.', price: 2,
    id: 'b2375c_50c35f23740d479fa4cea38b82dc9da7~mv2.jpg', pos: '50% 50%', alt: 'Going through the plans together',
    more: p('We price the project again as the design develops.') + p('This gives another opportunity to identify cost movements and make informed decisions before the plans are completed and submitted for consent.') + p('If necessary, elements can be redesigned, simplified or reprioritised at this stage.') },
  { n: 8, title: 'Client Approval to Proceed', sum: 'You approve the developed design and updated pricing.',
    id: 'b2375c_084da0b18d67401abbe9a74ac1d7f9ad~mv2.jpg', pos: '50% 50%', alt: 'Approval to proceed',
    more: p('Once the client is comfortable with the developed design and updated pricing, approval is given to move forward.') },
  { n: 9, title: 'Detailed Documentation + Building Consent', sum: 'The construction drawings are completed and lodged for consent.',
    id: 'b2375c_bdadd0a0b6bb4d58b71dedfe64e09241~mv2.jpg', pos: '60% 50%', alt: 'Plans and pricing on a computer screen',
    more: p('The architect completes the detailed construction documentation required for building consent.') + p('Engineering and other specialist consultants are coordinated as required, and the project is lodged for consent.') },
  { n: 10, title: 'Final Pricing + Construction Planning', sum: 'Final pricing, quotes and build planning while consent progresses.',
    id: 'b2375c_fbf4fe6caaa44a52aaa01a25f5d9436e~mv2.jpg', pos: '50% 50%', alt: 'Final pricing and planning',
    more: p('While consent is progressing, we continue developing the construction side of the project, including:') +
      ticks(['Final pricing and supplier quotes', 'Construction methodology', 'Procurement and lead times', 'Selections', 'Subcontractor planning', 'Programme and sequencing'], true) },
  { n: 11, title: 'Construction Programme Established', sum: 'A clear schedule: the start, the key stages and completion.',
    id: 'b2375c_e0d5d5f8178541ac9e30fb42cb2700cc~mv2.jpg', pos: '50% 50%', alt: 'The construction schedule',
    more: p('A detailed construction schedule is established so the client understands:') +
      ticks(['When we expect to start', 'The key stages of the build', 'The anticipated completion timeframe']) },
  { n: 12, title: 'Build', sum: 'Construction begins. We manage it through to handover and aftercare.',
    id: 'b2375c_00ae9c1519984a5b948de996e25c7f3c~mv2.jpg', pos: '50% 50%', alt: 'Construction on site',
    more: p('Once consent, pricing, contracts and programme are confirmed, construction begins.') + p('Thorne Group manages the project through construction, handover and aftercare.') },
];

export const pad = (n: number) => String(n).padStart(2, '0');

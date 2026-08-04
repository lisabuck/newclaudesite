/* Counts stat numbers (100+, 5x, 20) up from 1 when they scroll into view.
   Every number runs for the same time and lands together, so 1-100 moves
   fast while 1-5 moves gently. */
(function () {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var DUR = 900;

  function animate(el, target, suffix) {
    var t0 = null;
    function tick(now) {
      if (t0 === null) t0 = now;
      var p = Math.min(1, (now - t0) / DUR);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(1 + (target - 1) * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function init() {
    var nodes = document.querySelectorAll('.tg-stat > span:first-child, .pstat > .n');
    var seen = [];
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.dataset.tgCount) continue;
      var m = /^(\d+)\s*([+x×]?)$/.exec(el.textContent.trim());
      if (!m) continue;
      el.dataset.tgCount = m[1];
      el.dataset.tgSuffix = m[2];
      /* Reserve the final width so neighbours don't shuffle while counting. */
      el.style.minWidth = el.offsetWidth + 'px';
      el.style.display = 'inline-block';
      seen.push(el);
    }
    if (!seen.length) return;
    var started = false;
    var io = new IntersectionObserver(function (entries) {
      if (started || !entries.some(function (e) { return e.isIntersecting; })) return;
      /* One stat in view starts the whole strip so every number lands together. */
      started = true;
      seen.forEach(function (el) {
        io.unobserve(el);
        animate(el, parseInt(el.dataset.tgCount, 10), el.dataset.tgSuffix);
      });
    }, { threshold: 0.6 });
    seen.forEach(function (el) { io.observe(el); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', init); /* re-scan after the element scripts re-render */
})();

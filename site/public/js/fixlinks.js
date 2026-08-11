/* Connects the CTAs inside the page elements to their destinations.
   The element scripts re-render their original markup (with dead "#" links),
   so this runs after them and rewires anchors by their visible text.
   Only anchors whose href is "#", empty, or a bare "/contact" are touched;
   tel:, mailto: and full https:// links are left alone. */
(function () {
  'use strict';

  var CONTACT = 'https://www.thornegroup.co.nz/contact';

  var RULES = [
    { text: 'meet the team', href: '/about/team' },
    { text: 'view our projects', href: '/projects' },
    { text: 'view renovation projects', href: '/projects' },
    { text: 'read client stories', href: '/about/testimonials' },
    { text: 'ask for a demo', href: CONTACT },
    { text: 'book a feasibility discussion', href: CONTACT },
    { text: 'request a plan review', href: CONTACT },
    { text: 'start your project', href: CONTACT },
    { text: 'request the essential questions', href: CONTACT },
    { text: 'talk to our team', href: CONTACT },
    { text: 'book a free property assessment', href: CONTACT },
    { text: 'register your interest', href: CONTACT },
    { text: 'book a conversation', href: CONTACT },
    { text: 'start a conversation', href: CONTACT },
    { text: 'get in touch', href: CONTACT },
    { text: 'contact us', href: CONTACT },
    { text: 'privacy statement', href: '/privacy-statement' },
    { text: 'find out more', seq: ['/services/architectural-homes', '/services/renovations', '/services/development-collaborations'] },
    { text: 'learn more', scroll: true }
  ];

  function isDead(href) {
    return !href || href === '#' || href.indexOf('/contact') === 0;
  }

  function norm(t) {
    return (t || '').replace(/[→>]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  var SERVICES = {
    'architectural homes': '/services/architectural-homes',
    'renovations': '/services/renovations',
    'development collaborations': '/services/development-collaborations'
  };

  function linkStrips() {
    /* the hero strips render service names as plain spans; make them links */
    var spans = document.querySelectorAll('[class*="strip"] span');
    for (var i = 0; i < spans.length; i++) {
      var sp = spans[i];
      var target = SERVICES[norm(sp.textContent)];
      if (!target || sp.querySelector('a') || sp.className.indexOf('sep') !== -1) continue;
      var a = document.createElement('a');
      a.href = target;
      a.className = sp.className;
      a.setAttribute('style', (sp.getAttribute('style') || '') + ';color:inherit;text-decoration:none');
      a.textContent = sp.textContent;
      sp.parentNode.replaceChild(a, sp);
    }
  }

  function apply() {
    linkStrips();
    var seqCount = {};
    var anchors = document.querySelectorAll('a');
    for (var i = 0; i < anchors.length; i++) {
      var a = anchors[i];
      var raw = a.getAttribute('href');
      /* team profile pages still live on the current Wix site */
      if (raw && raw.indexOf('/our-team/') === 0) {
        a.setAttribute('href', 'https://www.thornegroup.co.nz' + raw);
        continue;
      }
      if (!isDead(raw)) continue;
      /* image-only links (project photo collages) go to the Projects page */
      if (!norm(a.textContent) && a.querySelector('img')) {
        a.setAttribute('href', '/projects');
        continue;
      }
      var t = norm(a.textContent);
      for (var r = 0; r < RULES.length; r++) {
        var rule = RULES[r];
        if (t.indexOf(rule.text) !== 0) continue;
        if (rule.seq) {
          var n = seqCount[rule.text] || 0;
          seqCount[rule.text] = n + 1;
          if (rule.seq[n]) a.setAttribute('href', rule.seq[n]);
        } else if (rule.scroll) {
          a.style.borderBottom = 'none'; /* hero Learn more is not underlined */
          a.addEventListener('click', function (e) {
            e.preventDefault();
            var sec = this.closest('section, header, div[class*="hero"]');
            var next = sec;
            while (next && !next.nextElementSibling) next = next.parentElement;
            var target = next && next.nextElementSibling;
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        } else {
          a.setAttribute('href', rule.href);
        }
        break;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();

/* Light-DOM adapter for the Thorne custom elements.
   The original element files render into shadow DOM. On this site the same
   markup is pre-rendered into the page for search engines; this shim makes
   the untouched element scripts render and wire themselves against the
   element's own (light) DOM instead of a shadow root, and stops them from
   re-injecting embedded fonts and FOUC guard styles that the site already
   handles with plain CSS. The element .js files themselves stay verbatim. */
(function () {
  'use strict';

  HTMLElement.prototype.attachShadow = function () {
    var el = this;
    return new Proxy(el, {
      get: function (t, p) {
        if (p === 'host') return t;
        if (p === 'getElementById') {
          return function (id) {
            return t.querySelector('#' + (window.CSS && CSS.escape ? CSS.escape(id) : id));
          };
        }
        var v = t[p];
        return typeof v === 'function' ? v.bind(t) : v;
      },
      set: function (t, p, v) {
        if (p === 'innerHTML') {
          /* The element scripts assign '<style>…</style>' + BODY.
             The style part is already on the page as scoped CSS; letting it
             through unscoped would leak into the header. Strip it. */
          t.innerHTML = String(v).replace(/^\s*<style>[\s\S]*?<\/style>/, '');
        } else {
          t[p] = v;
        }
        return true;
      }
    });
  };

  var headAppend = document.head.appendChild.bind(document.head);
  document.head.appendChild = function (node) {
    try {
      if (node && node.tagName === 'STYLE' &&
          (/@font-face/.test(node.textContent) || /:not\(:defined\)/.test(node.textContent))) {
        return node; /* fonts ship as files; FOUC guards are not needed on a pre-rendered page */
      }
    } catch (e) { /* fall through */ }
    return headAppend(node);
  };
})();

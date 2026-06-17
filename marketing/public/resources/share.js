/* Good Circles resource hub — lightweight share + copy-link helper.
   No dependencies. Reads the page's canonical URL + title so every share
   carries the correct link and a UTM tag back to the hub. */
(function () {
  function canonical() {
    var c = document.querySelector('link[rel="canonical"]');
    return c ? c.href : location.href;
  }
  function withUtm(url, medium) {
    var u = url + (url.indexOf('?') > -1 ? '&' : '?');
    return u + 'utm_source=share&utm_medium=' + medium + '&utm_campaign=resource_hub';
  }
  window.gcShare = function (medium) {
    var url = canonical();
    var title = document.title.split('·')[0].trim();
    var enc = encodeURIComponent, eu = enc(url), et = enc(title);
    var map = {
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + enc(withUtm(url, 'facebook')),
      x:        'https://twitter.com/intent/tweet?url=' + enc(withUtm(url, 'x')) + '&text=' + et,
      linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + enc(withUtm(url, 'linkedin')),
      email:    'mailto:?subject=' + et + '&body=' + et + '%0A%0A' + enc(withUtm(url, 'email'))
    };
    if (map[medium]) window.open(map[medium], '_blank', 'noopener,width=620,height=560');
  };
  window.gcCopy = function (btn) {
    navigator.clipboard.writeText(canonical()).then(function () {
      var t = btn.querySelector('.t'); if (!t) return;
      var old = t.textContent; t.textContent = 'Copied!';
      setTimeout(function () { t.textContent = old; }, 1600);
    });
  };
})();

/* "Was this page helpful?" — privacy-first feedback. No PII, no backend.
   De-dupes per page via localStorage; fires a GA4 event IF gtag/dataLayer is
   present (measurement-ready); a "No" reveals a mailto to a goodcircles.org alias.
   Auto-injected into <article> so no per-page markup is needed. */
(function () {
  var art = document.querySelector('article');
  if (!art) return;
  var c = document.querySelector('link[rel="canonical"]');
  var path = c ? c.href : location.href;
  var KEY = 'gcfb:' + path;
  try { if (localStorage.getItem(KEY)) return; } catch (e) {}
  var es = (document.documentElement.lang || '').slice(0, 2) === 'es';
  var T = es
    ? { q: '¿Te resultó útil esta página?', yes: 'Sí', no: 'No', thanks: '¡Gracias por tu comentario!', missing: 'Dinos qué faltó →' }
    : { q: 'Was this page helpful?', yes: 'Yes', no: 'No', thanks: 'Thanks for the feedback!', missing: 'Tell us what was missing →' };
  var box = document.createElement('div');
  box.className = 'gcfb';
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', T.q);
  box.innerHTML = '<span class="gcfb-q">' + T.q + '</span>' +
    '<button type="button" class="gcfb-b" data-v="yes">' + T.yes + '</button>' +
    '<button type="button" class="gcfb-b" data-v="no">' + T.no + '</button>';
  var rel = art.querySelector('.related');
  if (rel) art.insertBefore(box, rel); else art.appendChild(box);
  function track(v) {
    try {
      if (window.gtag) window.gtag('event', 'resource_feedback', { helpful: v, page: path });
      if (window.dataLayer) window.dataLayer.push({ event: 'resource_feedback', helpful: v, page: path });
    } catch (e) {}
  }
  function done(v) {
    try { localStorage.setItem(KEY, v + '|' + Date.now()); } catch (e) {}
    track(v);
    var html = '<span class="gcfb-q">' + T.thanks + '</span>';
    if (v === 'no') {
      var subj = encodeURIComponent('Resource feedback: ' + document.title.split('·')[0].trim());
      var body = encodeURIComponent('Page: ' + path + '\n\nWhat was missing or unclear?\n');
      html += ' <a class="gcfb-missing" href="mailto:hello@goodcircles.org?subject=' + subj + '&body=' + body + '">' + T.missing + '</a>';
    }
    box.innerHTML = html;
  }
  box.addEventListener('click', function (e) {
    var b = e.target.closest('.gcfb-b'); if (!b) return; done(b.getAttribute('data-v'));
  });
})();

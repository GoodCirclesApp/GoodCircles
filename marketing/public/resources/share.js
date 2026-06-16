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

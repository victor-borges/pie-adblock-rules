function facebookMarketplace(source, args) {
  function facebookMarketplace(source) {
    var e, o;
    0 < window.location.href.indexOf('marketplace') &&
      ((e = new MutationObserver(function () {
        document.querySelectorAll('div[role="main"] div[class][style^="max-width:"] div[class][style^="max-width:"]').forEach(function (e) {
          var l,
            t = e.querySelectorAll('a[href*="ads/about"]');
          'display: none !important;' == e.getAttribute('style') ||
            e.classList.contains('hidden_elem') ||
            (0 < t.length &&
              ((o += 1),
              '' == (l = e.querySelectorAll('a[href]')[0].innerText) && (l = e.querySelectorAll('a[href]')[1].innerText),
              '' == l && (l = e.querySelectorAll('a[href]')[0].querySelectorAll('a[aria-label]')[0]?.getAttribute('aria-label')),
              (e.style = 'display:none!important;')));
        });
      })),
      (o = 0),
      e.observe(document, {
        childList: !0,
        subtree: !0,
      }));
  }
  const updatedArgs = args ? [].concat(source).concat(args) : [source];
  if (!window._pisources) {
    window._pisources = {};
  }
  if (window._pisources[source.name]) {
    if (window._pisources[source.name].includes(JSON.stringify(args))) {
      return;
    }
  } else {
    window._pisources[source.name] = [];
  }
  window._pisources[source.name].push(JSON.stringify(args));
  try {
    facebookMarketplace.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default facebookMarketplace;

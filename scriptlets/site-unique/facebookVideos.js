function facebookVideos(source, args) {
  function facebookVideos(source) {
    new MutationObserver(function () {
      window.location.href.includes('/watch') &&
        document
          .querySelectorAll(
            '#watch_feed div:not([class]):not([id]) > div[class*=" "]:not([style*="display: none !important"]) div[class^="_"] > div[class*=" "]',
          )
          .forEach(function (b) {
            Object.keys(b).forEach(function (a) {
              if (a.includes('__reactFiber')) {
                a = b[a];
                try {
                  var c, d, e, f;
                  if (null == (c = a) ? 0 : null == (d = c['return']) ? 0 : null == (e = d.memoizedProps) ? 0 : null == (f = e.story) ? 0 : f.sponsored_data) {
                    var g = b.closest('#watch_feed div[class*=" "] div:not([class]):not([id]) > div[class*=" "]:not([style*="display: none !important"])');
                    g.style = 'display: none !important;';
                  }
                } catch (h) {}
              }
            });
          });
    }).observe(document, {
      childList: !0,
      subtree: !0,
      attributeFilter: ['style'],
    });
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
    facebookVideos.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default facebookVideos;

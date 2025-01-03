function facebookMarketplaceItem(source, args) {
  function facebookMarketplaceItem(source) {
    if (location.href.includes('marketplace/item')) {
      var b = 0,
        d = [];
      new MutationObserver(function () {
        document
          .querySelectorAll(
            "div[aria-label='Marketplace listing viewer'] > div div + div + span:not([style*='display: none']), #ssrb_feed_start + div > div div + div + span:not([style*='display: none'])",
          )
          .forEach(function (e) {
            Object.keys(e).forEach(function (a) {
              if (a.includes('__reactEvents') || a.includes('__reactProps')) {
                a = e[a];
                try {
                  if (a.children?.props?.children?.props?.adId) {
                    b++, (e.style = 'display: none !important;');
                    var f = e.querySelector('a[href][aria-label]:not([aria-hidden])');
                    f && d.push(['Ad blocked based on property [' + b + '] -> ' + f.ariaLabel]);
                  }
                } catch (a) {}
              }
            });
          });
      }).observe(document, {
        childList: !0,
        subtree: !0,
      });
    }
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
    facebookMarketplaceItem.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default facebookMarketplaceItem;

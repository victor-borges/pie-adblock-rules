function facebookMarketplaceHide(source, args) {
  function facebookMarketplaceHide(source) {
    new MutationObserver(function () {
      document
        .querySelectorAll('div[role="main"] div[class][style^="max-width:"] div[class][style*="max-width:"]:not([style*="display: none"])')
        .forEach(function (c) {
          Object.keys(c).forEach(function (a) {
            if (a.includes('__reactEvents') || a.includes('__reactProps')) {
              a = c[a];
              try {
                a.children?.props?.adSurface?.startsWith('Marketplace') && (c.style = 'display: none !important;');
              } catch (a) {}
            }
          });
        });
    }).observe(document, {
      childList: !0,
      subtree: !0,
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
    facebookMarketplaceHide.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default facebookMarketplaceHide;

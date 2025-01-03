function facebookMarketplaceUpsell(source, args) {
  function facebookMarketplaceUpsell(source) {
    if (window.location.href.includes('/marketplace/')) {
      new MutationObserver(function () {
        document.querySelectorAll('div[data-testid="marketplace_home_feed"] div[class][data-testid^="MarketplaceUpsell-"] > div > div').forEach(function (e) {
          var t = e.outerHTML;
          t && void 0 !== t && !0 === t.includes('/ads/about/') && (e.style = 'display:none!important;');
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
    facebookMarketplaceUpsell.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default facebookMarketplaceUpsell;

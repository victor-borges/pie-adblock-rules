function facebookSponsored(source, args) {
  function facebookSponsored(source) {
    var b = 0,
      d = [];
    new MutationObserver(function () {
      document
        .querySelectorAll(
          'div[data-pagelet^="FeedUnit"]:not([style*="display: none"]), div[role="feed"] > div:not([style*="display: none"]), div[role="feed"] > span:not([style*="display: none"]), #ssrb_feed_start + div > div[class]:not([style*="display: none"]), #ssrb_feed_start + div span > h3 ~ div[class]:not([style*="display: none"]), #ssrb_feed_start + div h3~ div[class]:not([style*="display: none"]), #ssrb_feed_start + div h3 ~ div > div[class]:not([style*="display: none"]), div[role="main"] div[class] > #ssrb_feed_start ~ div > h3 ~ div > div[class]:not([style*="display: none"]), div[role="main"] div > h3 ~ div > div[class]:not([style*="display: none"]), #ssrb_feed_start + div > div > div[class]:not([style*="display: none"]), div[role="main"] div > h2 ~ div > div[class]:not([style*="display: none"]), #ssrb_feed_start + div > div > div[class] > div:not([class], [id]) div:not([class], [id]):not([style*="display: none"]), div[role="main"] div > h3 ~ div > div[class] > div:not([class], [id]) div:not([class], [id], [dir], [data-0], [style]), div[role="main"] div > h2 ~ div > div[class] > div > div:not([style*="display: none"]), div[role="main"] h3[dir="auto"] + div > div[class]:not([style*="display: none"]), div[role="main"] div > h2 ~ div > div[class] > div > div:not([style*="display: none"]) > div:not([style*="display: none"]), div[role="main"] div > h2 ~ div > div > div > div:not([style*="display: none"]) > div:not([style*="display: none"]), div[role="main"] div > h3 ~ div > div > div > div:not([style*="display: none"]) > div:not([style*="display: none"])',
        )
        .forEach(function (e) {
          Object.keys(e).forEach(function (a) {
            if (a.includes?.('__reactEvents') || a.includes?.('__reactProps')) {
              a = e[a];
              try {
                if (
                  a.children?.props?.category?.includes('SPONSORED') ||
                  a.children?.props?.children?.props?.category?.includes('SPONSORED') ||
                  a.children?.props?.feedEdge?.category?.includes('SPONSORED') ||
                  a.children?.props?.children?.props?.feedEdge?.category?.includes('SPONSORED') ||
                  a.children?.props?.children?.props?.children?.props?.feedEdge?.category?.includes('SPONSORED') ||
                  a.children?.props?.children?.props?.children?.props?.children?.props?.feedEdge?.category?.includes('SPONSORED') ||
                  a.children?.props?.children?.props?.children?.props?.children?.props?.feedEdge?.feed_story_category?.includes('SPONSORED') ||
                  a.children?.props?.children?.props?.children?.props?.children?.props?.feedEdge?.story_category?.includes('SPONSORED') ||
                  a.children?.props?.children?.props?.children?.props?.children?.props?.feedEdge?.story_cat?.includes('SPONSORED') ||
                  a.children?.props?.children?.props?.children?.props?.children?.props?.feedEdge?.category_sensitive?.cat?.includes('SPONSORED') ||
                  a.children?.props?.children?.props?.children?.props?.children?.props?.feedEdge?.node?.sponsored_data?.brs_filter_setting ||
                  a.children?.props?.children?.props?.children?.props?.children?.props?.feedUnit?.lbl_sp_data?.ad_id ||
                  a.children?.props?.children?.props?.minGapType?.includes('SPONSORED')
                ) {
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
    facebookSponsored.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default facebookSponsored;

function ytShorts(source, args) {
  function ytShorts(source) {
    window.JSON.parse = new Proxy(JSON.parse, {
      apply(r, e, t) {
        const n = Reflect.apply(r, e, t);
        if (!location.pathname.startsWith('/shorts/')) {
          return n;
        }
        const a = n?.entries;
        return (
          a &&
            Array.isArray(a) &&
            (n.entries = n.entries.filter((r) => {
              if (!r?.command?.reelWatchEndpoint?.adClientParams?.isAd) return r;
            })),
          n
        );
      },
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
    ytShorts.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default ytShorts;

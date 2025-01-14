function setPopadsDummy(source, args) {
  function setPopadsDummy(source) {
    delete window.PopAds;
    delete window.popns;
    Object.defineProperties(window, {
      PopAds: {
        get: function get() {
          hit(source);
          return {};
        },
      },
      popns: {
        get: function get() {
          hit(source);
          return {};
        },
      },
    });
  }
  function hit(source) {
    if (source.verbose !== true) {
      return;
    }
    try {
      var log = console.log.bind(console);
      var trace = console.trace.bind(console);
      var prefix = '';
      if (source.domainName) {
        prefix += ''.concat(source.domainName);
      }
      prefix += "#%#//scriptlet('".concat(source.name, "', '").concat(source.args.join(', '), "')");
      log(''.concat(prefix, ' trace start'));
      if (trace) {
        trace();
      }
      log(''.concat(prefix, ' trace end'));
    } catch (e) {}
    if (typeof window.__debug === 'function') {
      window.__debug(source);
    }
  }
  const updatedArgs = args ? [].concat(source).concat(args) : [source];
  if (!window._scriptletdedupe) {
    window._scriptletdedupe = {};
  }
  if (window._scriptletdedupe[source.name]) {
    if (window._scriptletdedupe[source.name].includes(JSON.stringify(args))) {
      return;
    }
  } else {
    window._scriptletdedupe[source.name] = [];
  }
  window._scriptletdedupe[source.name].push(JSON.stringify(args));
  try {
    setPopadsDummy.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default setPopadsDummy;

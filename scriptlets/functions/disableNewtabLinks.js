function disableNewtabLinks(source, args) {
  function disableNewtabLinks(source) {
    document.addEventListener('click', function (ev) {
      var target = ev.target;
      while (target !== null) {
        if (target.localName === 'a' && target.hasAttribute('target')) {
          ev.stopPropagation();
          ev.preventDefault();
          hit(source);
          break;
        }
        target = target.parentNode;
      }
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
    disableNewtabLinks.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default disableNewtabLinks;

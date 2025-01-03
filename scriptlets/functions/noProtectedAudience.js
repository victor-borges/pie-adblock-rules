function noProtectedAudience(source, args) {
  function noProtectedAudience(source) {
    if (Document instanceof Object === false) {
      return;
    }
    var protectedAudienceMethods = {
      joinAdInterestGroup: noopResolveVoid,
      runAdAuction: noopResolveNull,
      leaveAdInterestGroup: noopResolveVoid,
      clearOriginJoinedAdInterestGroups: noopResolveVoid,
      createAuctionNonce: noopStr,
      updateAdInterestGroups: noopFunc,
    };
    for (var _i = 0, _Object$keys = Object.keys(protectedAudienceMethods); _i < _Object$keys.length; _i++) {
      var key = _Object$keys[_i];
      var methodName = key;
      var prototype = Navigator.prototype;
      if (!Object.prototype.hasOwnProperty.call(prototype, methodName) || prototype[methodName] instanceof Function === false) {
        continue;
      }
      prototype[methodName] = protectedAudienceMethods[methodName];
    }
    hit(source);
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
  function noopStr() {
    return '';
  }
  function noopFunc() {}
  function noopResolveVoid() {
    return Promise.resolve(undefined);
  }
  function noopResolveNull() {
    return Promise.resolve(null);
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
    noProtectedAudience.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default noProtectedAudience;

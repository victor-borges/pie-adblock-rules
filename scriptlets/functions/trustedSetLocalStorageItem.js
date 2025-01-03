function trustedSetLocalStorageItem(source, args) {
  function trustedSetLocalStorageItem(source, key, value) {
    if (typeof key === 'undefined') {
      logMessage(source, 'Item key should be specified');
      return;
    }
    if (typeof value === 'undefined') {
      logMessage(source, 'Item value should be specified');
      return;
    }
    var parsedValue = parseKeywordValue(value);
    var _window = window,
      localStorage = _window.localStorage;
    setStorageItem(source, localStorage, key, parsedValue);
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
  function logMessage(source, message) {
    var forced = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var convertMessageToString = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    var name = source.name,
      verbose = source.verbose;
    if (!forced && !verbose) {
      return;
    }
    var nativeConsole = console.log;
    if (!convertMessageToString) {
      nativeConsole(''.concat(name, ':'), message);
      return;
    }
    nativeConsole(''.concat(name, ': ').concat(message));
  }
  function nativeIsNaN(num) {
    var native = Number.isNaN || window.isNaN;
    return native(num);
  }
  function setStorageItem(source, storage, key, value) {
    try {
      storage.setItem(key, value);
    } catch (e) {
      var message = 'Unable to set sessionStorage item due to: '.concat(e.message);
      logMessage(source, message);
    }
  }
  function parseKeywordValue(rawValue) {
    var NOW_VALUE_KEYWORD = '$now$';
    var CURRENT_DATE_KEYWORD = '$currentDate$';
    var parsedValue = rawValue;
    if (rawValue === NOW_VALUE_KEYWORD) {
      parsedValue = Date.now().toString();
    } else if (rawValue === CURRENT_DATE_KEYWORD) {
      parsedValue = Date();
    }
    return parsedValue;
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
    trustedSetLocalStorageItem.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default trustedSetLocalStorageItem;

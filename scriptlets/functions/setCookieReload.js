function setCookieReload(source, args) {
  function setCookieReload(source, name, value) {
    var path = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '/';
    var domain = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
    if (isCookieSetWithValue(document.cookie, name, value)) {
      return;
    }
    var validValue = getLimitedCookieValue(value);
    if (validValue === null) {
      logMessage(source, "Invalid cookie value: '".concat(value, "'"));
      return;
    }
    if (!isValidCookiePath(path)) {
      logMessage(source, "Invalid cookie path: '".concat(path, "'"));
      return;
    }
    if (!document.location.origin.includes(domain)) {
      logMessage(source, "Cookie domain not matched by origin: '".concat(domain, "'"));
      return;
    }
    var cookieToSet = serializeCookie(name, validValue, path, domain);
    if (!cookieToSet) {
      logMessage(source, 'Invalid cookie name or value');
      return;
    }
    document.cookie = cookieToSet;
    hit(source);
    if (isCookieSetWithValue(document.cookie, name, value)) {
      window.location.reload();
    }
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
  function isCookieSetWithValue(cookieString, name, value) {
    return cookieString.split(';').some(function (cookieStr) {
      var pos = cookieStr.indexOf('=');
      if (pos === -1) {
        return false;
      }
      var cookieName = cookieStr.slice(0, pos).trim();
      var cookieValue = cookieStr.slice(pos + 1).trim();
      return name === cookieName && value === cookieValue;
    });
  }
  function getLimitedCookieValue(value) {
    if (!value) {
      return null;
    }
    var allowedCookieValues = new Set([
      'true',
      't',
      'false',
      'f',
      'yes',
      'y',
      'no',
      'n',
      'ok',
      'on',
      'off',
      'accept',
      'accepted',
      'notaccepted',
      'reject',
      'rejected',
      'allow',
      'allowed',
      'disallow',
      'deny',
      'enable',
      'enabled',
      'disable',
      'disabled',
      'necessary',
      'required',
    ]);
    var validValue;
    if (allowedCookieValues.has(value.toLowerCase())) {
      validValue = value;
    } else if (/^\d+$/.test(value)) {
      validValue = parseFloat(value);
      if (nativeIsNaN(validValue)) {
        return null;
      }
      if (Math.abs(validValue) < 0 || Math.abs(validValue) > 32767) {
        return null;
      }
    } else {
      return null;
    }
    return validValue;
  }
  function serializeCookie(name, rawValue, rawPath) {
    var domainValue = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
    var shouldEncodeValue = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
    var COOKIE_BREAKER = ';';
    if ((!shouldEncodeValue && ''.concat(rawValue).includes(COOKIE_BREAKER)) || name.includes(COOKIE_BREAKER)) {
      return null;
    }
    var value = shouldEncodeValue ? encodeURIComponent(rawValue) : rawValue;
    var resultCookie = ''.concat(name, '=').concat(value);
    var path = getCookiePath(rawPath);
    if (path) {
      resultCookie += '; '.concat(path);
    }
    if (domainValue) {
      resultCookie += '; domain='.concat(domainValue);
    }
    return resultCookie;
  }
  function isValidCookiePath(rawPath) {
    return rawPath === '/' || rawPath === 'none';
  }
  function getCookiePath(rawPath) {
    if (rawPath === '/') {
      return 'path=/';
    }
    return '';
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
    setCookieReload.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default setCookieReload;

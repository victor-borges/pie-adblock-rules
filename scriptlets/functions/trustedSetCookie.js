function trustedSetCookie(source, args) {
  function trustedSetCookie(source, name, value) {
    var offsetExpiresSec = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
    var path = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '/';
    var domain = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '';
    if (typeof name === 'undefined') {
      logMessage(source, 'Cookie name should be specified');
      return;
    }
    if (typeof value === 'undefined') {
      logMessage(source, 'Cookie value should be specified');
      return;
    }
    var parsedValue = parseKeywordValue(value);
    if (!isValidCookiePath(path)) {
      logMessage(source, "Invalid cookie path: '".concat(path, "'"));
      return;
    }
    if (!document.location.origin.includes(domain)) {
      logMessage(source, "Cookie domain not matched by origin: '".concat(domain, "'"));
      return;
    }
    var cookieToSet = serializeCookie(name, parsedValue, path, domain, false);
    if (!cookieToSet) {
      logMessage(source, 'Invalid cookie name or value');
      return;
    }
    if (offsetExpiresSec) {
      var parsedOffsetMs = getTrustedCookieOffsetMs(offsetExpiresSec);
      if (!parsedOffsetMs) {
        logMessage(source, 'Invalid offsetExpiresSec value: '.concat(offsetExpiresSec));
        return;
      }
      var expires = Date.now() + parsedOffsetMs;
      cookieToSet += '; expires='.concat(new Date(expires).toUTCString());
    }
    document.cookie = cookieToSet;
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
  function getTrustedCookieOffsetMs(offsetExpiresSec) {
    var ONE_YEAR_EXPIRATION_KEYWORD = '1year';
    var ONE_DAY_EXPIRATION_KEYWORD = '1day';
    var MS_IN_SEC = 1e3;
    var SECONDS_IN_YEAR = 365 * 24 * 60 * 60;
    var SECONDS_IN_DAY = 24 * 60 * 60;
    var parsedSec;
    if (offsetExpiresSec === ONE_YEAR_EXPIRATION_KEYWORD) {
      parsedSec = SECONDS_IN_YEAR;
    } else if (offsetExpiresSec === ONE_DAY_EXPIRATION_KEYWORD) {
      parsedSec = SECONDS_IN_DAY;
    } else {
      parsedSec = Number.parseInt(offsetExpiresSec, 10);
      if (Number.isNaN(parsedSec)) {
        return null;
      }
    }
    return parsedSec * MS_IN_SEC;
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
    trustedSetCookie.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default trustedSetCookie;

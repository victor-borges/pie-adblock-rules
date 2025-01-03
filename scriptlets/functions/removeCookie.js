function removeCookie(source, args) {
  function removeCookie(source, match) {
    var matchRegexp = toRegExp(match);
    var removeCookieFromHost = function removeCookieFromHost(cookieName, hostName) {
      var cookieSpec = ''.concat(cookieName, '=');
      var domain1 = '; domain='.concat(hostName);
      var domain2 = '; domain=.'.concat(hostName);
      var path = '; path=/';
      var expiration = '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = cookieSpec + expiration;
      document.cookie = cookieSpec + domain1 + expiration;
      document.cookie = cookieSpec + domain2 + expiration;
      document.cookie = cookieSpec + path + expiration;
      document.cookie = cookieSpec + domain1 + path + expiration;
      document.cookie = cookieSpec + domain2 + path + expiration;
      hit(source);
    };
    var rmCookie = function rmCookie() {
      document.cookie.split(';').forEach(function (cookieStr) {
        var pos = cookieStr.indexOf('=');
        if (pos === -1) {
          return;
        }
        var cookieName = cookieStr.slice(0, pos).trim();
        if (!matchRegexp.test(cookieName)) {
          return;
        }
        var hostParts = document.location.hostname.split('.');
        for (var i = 0; i <= hostParts.length - 1; i += 1) {
          var hostName = hostParts.slice(i).join('.');
          if (hostName) {
            removeCookieFromHost(cookieName, hostName);
          }
        }
      });
    };
    rmCookie();
    window.addEventListener('beforeunload', rmCookie);
  }
  function toRegExp() {
    var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var DEFAULT_VALUE = '.?';
    var FORWARD_SLASH = '/';
    if (input === '') {
      return new RegExp(DEFAULT_VALUE);
    }
    var delimiterIndex = input.lastIndexOf(FORWARD_SLASH);
    var flagsPart = input.substring(delimiterIndex + 1);
    var regExpPart = input.substring(0, delimiterIndex + 1);
    var isValidRegExpFlag = function isValidRegExpFlag(flag) {
      if (!flag) {
        return false;
      }
      try {
        new RegExp('', flag);
        return true;
      } catch (ex) {
        return false;
      }
    };
    var getRegExpFlags = function getRegExpFlags(regExpStr, flagsStr) {
      if (regExpStr.startsWith(FORWARD_SLASH) && regExpStr.endsWith(FORWARD_SLASH) && !regExpStr.endsWith('\\/') && isValidRegExpFlag(flagsStr)) {
        return flagsStr;
      }
      return '';
    };
    var flags = getRegExpFlags(regExpPart, flagsPart);
    if ((input.startsWith(FORWARD_SLASH) && input.endsWith(FORWARD_SLASH)) || flags) {
      var regExpInput = flags ? regExpPart : input;
      return new RegExp(regExpInput.slice(1, -1), flags);
    }
    var escaped = input
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped);
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
    removeCookie.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default removeCookie;

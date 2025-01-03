function forceWindowClose(source, args) {
  function forceWindowClose(source) {
    var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    if (typeof window.close !== 'function') {
      var message = "window.close() is not a function so 'close-window' scriptlet is unavailable";
      logMessage(source, message);
      return;
    }
    var closeImmediately = function closeImmediately() {
      try {
        hit(source);
        window.close();
      } catch (e) {
        logMessage(source, e);
      }
    };
    var closeByExtension = function closeByExtension() {
      var extCall = function extCall() {
        dispatchEvent(new Event('adguard:scriptlet-close-window'));
      };
      window.addEventListener('adguard:subscribed-to-close-window', extCall, {
        once: true,
      });
      setTimeout(function () {
        window.removeEventListener('adguard:subscribed-to-close-window', extCall, {
          once: true,
        });
      }, 5e3);
    };
    var shouldClose = function shouldClose() {
      if (path === '') {
        return true;
      }
      var pathRegexp = toRegExp(path);
      var currentPath = ''.concat(window.location.pathname).concat(window.location.search);
      return pathRegexp.test(currentPath);
    };
    if (shouldClose()) {
      closeImmediately();
      if (navigator.userAgent.includes('Chrome')) {
        closeByExtension();
      }
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
    forceWindowClose.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default forceWindowClose;

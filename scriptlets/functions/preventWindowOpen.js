function preventWindowOpen(source, args) {
  function preventWindowOpen(source) {
    var match = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '*';
    var delay = arguments.length > 2 ? arguments[2] : undefined;
    var replacement = arguments.length > 3 ? arguments[3] : undefined;
    var nativeOpen = window.open;
    var isNewSyntax = match !== '0' && match !== '1';
    var oldOpenWrapper = function oldOpenWrapper(str) {
      match = Number(match) > 0;
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      if (!isValidStrPattern(delay)) {
        logMessage(source, 'Invalid parameter: '.concat(delay));
        return nativeOpen.apply(window, [str, ...args]);
      }
      var searchRegexp = toRegExp(delay);
      if (match !== searchRegexp.test(str)) {
        return nativeOpen.apply(window, [str, ...args]);
      }
      hit(source);
      return handleOldReplacement(replacement);
    };
    var newOpenWrapper = function newOpenWrapper(url) {
      var shouldLog = replacement && replacement.includes('log');
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }
      if (shouldLog) {
        var argsStr = args && args.length > 0 ? ', '.concat(args.join(', ')) : '';
        var message = ''.concat(url).concat(argsStr);
        logMessage(source, message, true);
        hit(source);
      }
      var shouldPrevent = false;
      if (match === '*') {
        shouldPrevent = true;
      } else if (isValidMatchStr(match)) {
        var _parseMatchArg = parseMatchArg(match),
          isInvertedMatch = _parseMatchArg.isInvertedMatch,
          matchRegexp = _parseMatchArg.matchRegexp;
        shouldPrevent = matchRegexp.test(url) !== isInvertedMatch;
      } else {
        logMessage(source, 'Invalid parameter: '.concat(match));
        shouldPrevent = false;
      }
      if (shouldPrevent) {
        var parsedDelay = parseInt(delay, 10);
        var result;
        if (nativeIsNaN(parsedDelay)) {
          result = noopNull();
        } else {
          var decoyArgs = {
            replacement: replacement,
            url: url,
            delay: parsedDelay,
          };
          var decoy = createDecoy(decoyArgs);
          var popup = decoy.contentWindow;
          if (typeof popup === 'object' && popup !== null) {
            Object.defineProperty(popup, 'closed', {
              value: false,
            });
            Object.defineProperty(popup, 'opener', {
              value: window,
            });
            Object.defineProperty(popup, 'frameElement', {
              value: null,
            });
          } else {
            var nativeGetter = decoy.contentWindow && decoy.contentWindow.get;
            Object.defineProperty(decoy, 'contentWindow', {
              get: getPreventGetter(nativeGetter),
            });
            popup = decoy.contentWindow;
          }
          result = popup;
        }
        hit(source);
        return result;
      }
      return nativeOpen.apply(window, [url, ...args]);
    };
    window.open = isNewSyntax ? newOpenWrapper : oldOpenWrapper;
    window.open.toString = nativeOpen.toString.bind(nativeOpen);
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
  function isValidStrPattern(input) {
    var FORWARD_SLASH = '/';
    var str = escapeRegExp(input);
    if (input[0] === FORWARD_SLASH && input[input.length - 1] === FORWARD_SLASH) {
      str = input.slice(1, -1);
    }
    var isValid;
    try {
      isValid = new RegExp(str);
      isValid = true;
    } catch (e) {
      isValid = false;
    }
    return isValid;
  }
  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  function isValidMatchStr(match) {
    var INVERT_MARKER = '!';
    var str = match;
    if (match !== null && match !== void 0 && match.startsWith(INVERT_MARKER)) {
      str = match.slice(1);
    }
    return isValidStrPattern(str);
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
  function nativeIsNaN(num) {
    var native = Number.isNaN || window.isNaN;
    return native(num);
  }
  function parseMatchArg(match) {
    var INVERT_MARKER = '!';
    var isInvertedMatch = match ? (match === null || match === void 0 ? void 0 : match.startsWith(INVERT_MARKER)) : false;
    var matchValue = isInvertedMatch ? match.slice(1) : match;
    var matchRegexp = toRegExp(matchValue);
    return {
      isInvertedMatch: isInvertedMatch,
      matchRegexp: matchRegexp,
      matchValue: matchValue,
    };
  }
  function handleOldReplacement(replacement) {
    var result;
    if (!replacement) {
      result = noopFunc;
    } else if (replacement === 'trueFunc') {
      result = trueFunc;
    } else if (replacement.includes('=')) {
      var isProp = replacement.startsWith('{') && replacement.endsWith('}');
      if (isProp) {
        var propertyPart = replacement.slice(1, -1);
        var propertyName = substringBefore(propertyPart, '=');
        var propertyValue = substringAfter(propertyPart, '=');
        if (propertyValue === 'noopFunc') {
          result = {};
          result[propertyName] = noopFunc;
        }
      }
    }
    return result;
  }
  function createDecoy(args) {
    var UrlPropNameOf = (function (UrlPropNameOf) {
      UrlPropNameOf['Object'] = 'data';
      UrlPropNameOf['Iframe'] = 'src';
      return UrlPropNameOf;
    })({});
    var replacement = args.replacement,
      url = args.url,
      delay = args.delay;
    var tag;
    if (replacement === 'obj') {
      tag = 'object';
    } else {
      tag = 'iframe';
    }
    var decoy = document.createElement(tag);
    if (decoy instanceof HTMLObjectElement) {
      decoy[UrlPropNameOf.Object] = url;
    } else if (decoy instanceof HTMLIFrameElement) {
      decoy[UrlPropNameOf.Iframe] = url;
    }
    decoy.style.setProperty('height', '1px', 'important');
    decoy.style.setProperty('position', 'fixed', 'important');
    decoy.style.setProperty('top', '-1px', 'important');
    decoy.style.setProperty('width', '1px', 'important');
    document.body.appendChild(decoy);
    setTimeout(function () {
      return decoy.remove();
    }, delay * 1e3);
    return decoy;
  }
  function getPreventGetter(nativeGetter) {
    var preventGetter = function preventGetter(target, prop) {
      if (prop && prop === 'closed') {
        return false;
      }
      if (typeof nativeGetter === 'function') {
        return noopFunc;
      }
      return prop && target[prop];
    };
    return preventGetter;
  }
  function noopNull() {
    return null;
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
  function noopFunc() {}
  function trueFunc() {
    return true;
  }
  function substringBefore(str, separator) {
    if (!str || !separator) {
      return str;
    }
    var index = str.indexOf(separator);
    return index < 0 ? str : str.substring(0, index);
  }
  function substringAfter(str, separator) {
    if (!str) {
      return str;
    }
    var index = str.indexOf(separator);
    return index < 0 ? '' : str.substring(index + separator.length);
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
    preventWindowOpen.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default preventWindowOpen;

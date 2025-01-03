function preventSetInterval(source, args) {
  function preventSetInterval(source, matchCallback, matchDelay) {
    var shouldLog = typeof matchCallback === 'undefined' && typeof matchDelay === 'undefined';
    var handlerWrapper = function handlerWrapper(target, thisArg, args) {
      var callback = args[0];
      var delay = args[1];
      var shouldPrevent = false;
      if (shouldLog) {
        hit(source);
        logMessage(source, 'setInterval('.concat(String(callback), ', ').concat(delay, ')'), true);
      } else {
        shouldPrevent = isPreventionNeeded({
          callback: callback,
          delay: delay,
          matchCallback: matchCallback,
          matchDelay: matchDelay,
        });
      }
      if (shouldPrevent) {
        hit(source);
        args[0] = noopFunc;
      }
      return target.apply(thisArg, args);
    };
    var setIntervalHandler = {
      apply: handlerWrapper,
    };
    window.setInterval = new Proxy(window.setInterval, setIntervalHandler);
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
  function noopFunc() {}
  function isPreventionNeeded(_ref) {
    var callback = _ref.callback,
      delay = _ref.delay,
      matchCallback = _ref.matchCallback,
      matchDelay = _ref.matchDelay;
    if (!isValidCallback(callback)) {
      return false;
    }
    if (!isValidMatchStr(matchCallback) || (matchDelay && !isValidMatchNumber(matchDelay))) {
      return false;
    }
    var _parseMatchArg = parseMatchArg(matchCallback),
      isInvertedMatch = _parseMatchArg.isInvertedMatch,
      matchRegexp = _parseMatchArg.matchRegexp;
    var _parseDelayArg = parseDelayArg(matchDelay),
      isInvertedDelayMatch = _parseDelayArg.isInvertedDelayMatch,
      delayMatch = _parseDelayArg.delayMatch;
    var parsedDelay = parseRawDelay(delay);
    var shouldPrevent = false;
    var callbackStr = String(callback);
    if (delayMatch === null) {
      shouldPrevent = matchRegexp.test(callbackStr) !== isInvertedMatch;
    } else if (!matchCallback) {
      shouldPrevent = (parsedDelay === delayMatch) !== isInvertedDelayMatch;
    } else {
      shouldPrevent = matchRegexp.test(callbackStr) !== isInvertedMatch && (parsedDelay === delayMatch) !== isInvertedDelayMatch;
    }
    return shouldPrevent;
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
  function parseDelayArg(delay) {
    var INVERT_MARKER = '!';
    var isInvertedDelayMatch = delay === null || delay === void 0 ? void 0 : delay.startsWith(INVERT_MARKER);
    var delayValue = isInvertedDelayMatch ? delay.slice(1) : delay;
    var parsedDelay = parseInt(delayValue, 10);
    var delayMatch = nativeIsNaN(parsedDelay) ? null : parsedDelay;
    return {
      isInvertedDelayMatch: isInvertedDelayMatch,
      delayMatch: delayMatch,
    };
  }
  function isValidCallback(callback) {
    return callback instanceof Function || typeof callback === 'string';
  }
  function isValidMatchStr(match) {
    var INVERT_MARKER = '!';
    var str = match;
    if (match !== null && match !== void 0 && match.startsWith(INVERT_MARKER)) {
      str = match.slice(1);
    }
    return isValidStrPattern(str);
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
  function nativeIsFinite(num) {
    var native = Number.isFinite || window.isFinite;
    return native(num);
  }
  function isValidMatchNumber(match) {
    var INVERT_MARKER = '!';
    var str = match;
    if (match !== null && match !== void 0 && match.startsWith(INVERT_MARKER)) {
      str = match.slice(1);
    }
    var num = parseFloat(str);
    return !nativeIsNaN(num) && nativeIsFinite(num);
  }
  function parseRawDelay(delay) {
    var parsedDelay = Math.floor(parseInt(delay, 10));
    return typeof parsedDelay === 'number' && !nativeIsNaN(parsedDelay) ? parsedDelay : delay;
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
    preventSetInterval.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default preventSetInterval;

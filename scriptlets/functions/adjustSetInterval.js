function adjustSetInterval(source, args) {
  function adjustSetInterval(source, matchCallback, matchDelay, boost) {
    var nativeSetInterval = window.setInterval;
    var matchRegexp = toRegExp(matchCallback);
    var intervalWrapper = function intervalWrapper(callback, delay) {
      if (!isValidCallback(callback)) {
        var message = "Scriptlet can't be applied because of invalid callback: '".concat(String(callback), "'");
        logMessage(source, message);
      } else if (matchRegexp.test(callback.toString()) && isDelayMatched(matchDelay, delay)) {
        delay *= getBoostMultiplier(boost);
        hit(source);
      }
      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }
      return nativeSetInterval.apply(window, [callback, delay, ...args]);
    };
    window.setInterval = intervalWrapper;
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
  function isValidCallback(callback) {
    return callback instanceof Function || typeof callback === 'string';
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
  function getBoostMultiplier(boost) {
    var DEFAULT_MULTIPLIER = 0.05;
    var MIN_MULTIPLIER = 0.001;
    var MAX_MULTIPLIER = 50;
    var parsedBoost = parseFloat(boost);
    var boostMultiplier = nativeIsNaN(parsedBoost) || !nativeIsFinite(parsedBoost) ? DEFAULT_MULTIPLIER : parsedBoost;
    if (boostMultiplier < MIN_MULTIPLIER) {
      boostMultiplier = MIN_MULTIPLIER;
    }
    if (boostMultiplier > MAX_MULTIPLIER) {
      boostMultiplier = MAX_MULTIPLIER;
    }
    return boostMultiplier;
  }
  function isDelayMatched(inputDelay, realDelay) {
    return shouldMatchAnyDelay(inputDelay) || realDelay === getMatchDelay(inputDelay);
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
  function nativeIsFinite(num) {
    var native = Number.isFinite || window.isFinite;
    return native(num);
  }
  function getMatchDelay(delay) {
    var DEFAULT_DELAY = 1e3;
    var parsedDelay = parseInt(delay, 10);
    var delayMatch = nativeIsNaN(parsedDelay) ? DEFAULT_DELAY : parsedDelay;
    return delayMatch;
  }
  function shouldMatchAnyDelay(delay) {
    return delay === '*';
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
    adjustSetInterval.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default adjustSetInterval;

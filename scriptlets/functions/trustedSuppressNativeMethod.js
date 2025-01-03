function trustedSuppressNativeMethod(source, args) {
  function trustedSuppressNativeMethod(source, methodPath, signatureStr) {
    var how = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'abort';
    var stack = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
    if (!methodPath || !signatureStr) {
      return;
    }
    var IGNORE_ARG_SYMBOL = ' ';
    var suppress = how === 'abort' ? getAbortFunc() : function () {};
    var signatureMatcher;
    try {
      signatureMatcher = signatureStr.split('|').map(function (value) {
        return value === IGNORE_ARG_SYMBOL ? value : inferValue(value);
      });
    } catch (e) {
      logMessage(source, 'Could not parse the signature matcher: '.concat(getErrorMessage(e)));
      return;
    }
    var getPathParts = getPropertyInChain;
    var _getPathParts = getPathParts(window, methodPath),
      base = _getPathParts.base,
      chain = _getPathParts.chain,
      prop = _getPathParts.prop;
    if (typeof chain !== 'undefined') {
      logMessage(source, 'Could not reach the end of the prop chain: '.concat(methodPath));
      return;
    }
    var nativeMethod = base[prop];
    if (!nativeMethod || typeof nativeMethod !== 'function') {
      logMessage(source, 'Could not retrieve the method: '.concat(methodPath));
      return;
    }
    function matchMethodCall(nativeArguments, matchArguments) {
      return matchArguments.every(function (matcher, i) {
        if (matcher === IGNORE_ARG_SYMBOL) {
          return true;
        }
        var argument = nativeArguments[i];
        return isValueMatched(argument, matcher);
      });
    }
    var isMatchingSuspended = false;
    function apply(target, thisArg, argumentsList) {
      if (isMatchingSuspended) {
        return Reflect.apply(target, thisArg, argumentsList);
      }
      isMatchingSuspended = true;
      if (stack && !matchStackTrace(stack, new Error().stack || '')) {
        return Reflect.apply(target, thisArg, argumentsList);
      }
      var isMatching = matchMethodCall(argumentsList, signatureMatcher);
      isMatchingSuspended = false;
      if (isMatching) {
        hit(source);
        return suppress();
      }
      return Reflect.apply(target, thisArg, argumentsList);
    }
    base[prop] = new Proxy(nativeMethod, {
      apply: apply,
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
  function getPropertyInChain(base, chain) {
    var pos = chain.indexOf('.');
    if (pos === -1) {
      return {
        base: base,
        prop: chain,
      };
    }
    var prop = chain.slice(0, pos);
    if (base === null) {
      return {
        base: base,
        prop: prop,
        chain: chain,
      };
    }
    var nextBase = base[prop];
    chain = chain.slice(pos + 1);
    if ((base instanceof Object || typeof base === 'object') && isEmptyObject(base)) {
      return {
        base: base,
        prop: prop,
        chain: chain,
      };
    }
    if (nextBase === null) {
      return {
        base: base,
        prop: prop,
        chain: chain,
      };
    }
    if (nextBase !== undefined) {
      return getPropertyInChain(nextBase, chain);
    }
    Object.defineProperty(base, prop, {
      configurable: true,
    });
    return {
      base: base,
      prop: prop,
      chain: chain,
    };
  }
  function inferValue(value) {
    if (value === 'undefined') {
      return undefined;
    }
    if (value === 'false') {
      return false;
    }
    if (value === 'true') {
      return true;
    }
    if (value === 'null') {
      return null;
    }
    if (value === 'NaN') {
      return NaN;
    }
    if (value.startsWith('/') && value.endsWith('/')) {
      return toRegExp(value);
    }
    var MAX_ALLOWED_NUM = 32767;
    var numVal = Number(value);
    if (!nativeIsNaN(numVal)) {
      if (Math.abs(numVal) > MAX_ALLOWED_NUM) {
        throw new Error('number values bigger than 32767 are not allowed');
      }
      return numVal;
    }
    var errorMessage = "'".concat(value, "' value type can't be inferred");
    try {
      var parsableVal = JSON.parse(value);
      if (parsableVal instanceof Object || typeof parsableVal === 'string') {
        return parsableVal;
      }
    } catch (e) {
      errorMessage += ': '.concat(e);
    }
    throw new TypeError(errorMessage);
  }
  function isValueMatched(value, matcher) {
    if (typeof value === 'function') {
      return false;
    }
    if (nativeIsNaN(value)) {
      return nativeIsNaN(matcher);
    }
    if (value === null || typeof value === 'undefined' || typeof value === 'number' || typeof value === 'boolean') {
      return value === matcher;
    }
    if (typeof value === 'string') {
      if (typeof matcher === 'string' || matcher instanceof RegExp) {
        return isStringMatched(value, matcher);
      }
      return false;
    }
    if (Array.isArray(value) && Array.isArray(matcher)) {
      return isArrayMatched(value, matcher);
    }
    if (isArbitraryObject(value) && isArbitraryObject(matcher)) {
      return isObjectMatched(value, matcher);
    }
    return false;
  }
  function getAbortFunc() {
    var rid = randomId();
    var isErrorHandlerSet = false;
    return function abort() {
      if (!isErrorHandlerSet) {
        window.onerror = createOnErrorHandler(rid);
        isErrorHandlerSet = true;
      }
      throw new ReferenceError(rid);
    };
  }
  function matchStackTrace(stackMatch, stackTrace) {
    if (!stackMatch || stackMatch === '') {
      return true;
    }
    if (shouldAbortInlineOrInjectedScript(stackMatch, stackTrace)) {
      return true;
    }
    var stackRegexp = toRegExp(stackMatch);
    var refinedStackTrace = stackTrace
      .split('\n')
      .slice(2)
      .map(function (line) {
        return line.trim();
      })
      .join('\n');
    return getNativeRegexpTest().call(stackRegexp, refinedStackTrace);
  }
  function getErrorMessage(error) {
    var isErrorWithMessage = function isErrorWithMessage(e) {
      return typeof e === 'object' && e !== null && 'message' in e && typeof e.message === 'string';
    };
    if (isErrorWithMessage(error)) {
      return error.message;
    }
    try {
      return new Error(JSON.stringify(error)).message;
    } catch (_unused) {
      return new Error(String(error)).message;
    }
  }
  function shouldAbortInlineOrInjectedScript(stackMatch, stackTrace) {
    var INLINE_SCRIPT_STRING = 'inlineScript';
    var INJECTED_SCRIPT_STRING = 'injectedScript';
    var INJECTED_SCRIPT_MARKER = '<anonymous>';
    var isInlineScript = function isInlineScript(match) {
      return match.includes(INLINE_SCRIPT_STRING);
    };
    var isInjectedScript = function isInjectedScript(match) {
      return match.includes(INJECTED_SCRIPT_STRING);
    };
    if (!(isInlineScript(stackMatch) || isInjectedScript(stackMatch))) {
      return false;
    }
    var documentURL = window.location.href;
    var pos = documentURL.indexOf('#');
    if (pos !== -1) {
      documentURL = documentURL.slice(0, pos);
    }
    var stackSteps = stackTrace
      .split('\n')
      .slice(2)
      .map(function (line) {
        return line.trim();
      });
    var stackLines = stackSteps.map(function (line) {
      var stack;
      var getStackTraceURL = /(.*?@)?(\S+)(:\d+):\d+\)?$/.exec(line);
      if (getStackTraceURL) {
        var _stackURL, _stackURL2;
        var stackURL = getStackTraceURL[2];
        if ((_stackURL = stackURL) !== null && _stackURL !== void 0 && _stackURL.startsWith('(')) {
          stackURL = stackURL.slice(1);
        }
        if ((_stackURL2 = stackURL) !== null && _stackURL2 !== void 0 && _stackURL2.startsWith(INJECTED_SCRIPT_MARKER)) {
          var _stackFunction;
          stackURL = INJECTED_SCRIPT_STRING;
          var stackFunction = getStackTraceURL[1] !== undefined ? getStackTraceURL[1].slice(0, -1) : line.slice(0, getStackTraceURL.index).trim();
          if ((_stackFunction = stackFunction) !== null && _stackFunction !== void 0 && _stackFunction.startsWith('at')) {
            stackFunction = stackFunction.slice(2).trim();
          }
          stack = ''.concat(stackFunction, ' ').concat(stackURL).trim();
        } else {
          stack = stackURL;
        }
      } else {
        stack = line;
      }
      return stack;
    });
    if (stackLines) {
      for (var index = 0; index < stackLines.length; index += 1) {
        if (isInlineScript(stackMatch) && documentURL === stackLines[index]) {
          return true;
        }
        if (isInjectedScript(stackMatch) && stackLines[index].startsWith(INJECTED_SCRIPT_STRING)) {
          return true;
        }
      }
    }
    return false;
  }
  function getNativeRegexpTest() {
    var descriptor = Object.getOwnPropertyDescriptor(RegExp.prototype, 'test');
    var nativeRegexTest = descriptor === null || descriptor === void 0 ? void 0 : descriptor.value;
    if (descriptor && typeof descriptor.value === 'function') {
      return nativeRegexTest;
    }
    throw new Error('RegExp.prototype.test is not a function');
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
  function randomId() {
    return Math.random().toString(36).slice(2, 9);
  }
  function createOnErrorHandler(rid) {
    var nativeOnError = window.onerror;
    return function onError(error) {
      if (typeof error === 'string' && error.includes(rid)) {
        return true;
      }
      if (nativeOnError instanceof Function) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        return nativeOnError.apply(window, [error, ...args]);
      }
      return false;
    };
  }
  function isEmptyObject(obj) {
    return Object.keys(obj).length === 0 && !obj.prototype;
  }
  function isArbitraryObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof RegExp);
  }
  function isStringMatched(str, matcher) {
    if (typeof matcher === 'string') {
      if (matcher === '') {
        return str === matcher;
      }
      return str.includes(matcher);
    }
    if (matcher instanceof RegExp) {
      return matcher.test(str);
    }
    return false;
  }
  function isArrayMatched(array, matcher) {
    if (array.length === 0) {
      return matcher.length === 0;
    }
    if (matcher.length === 0) {
      return false;
    }
    var _loop = function _loop() {
      var matcherValue = matcher[i];
      var isMatching = array.some(function (arrItem) {
        return isValueMatched(arrItem, matcherValue);
      });
      if (!isMatching) {
        return {
          v: false,
        };
      }
      return 'continue';
    };
    for (var i = 0; i < matcher.length; i += 1) {
      var _ret = _loop();
      if (_ret === 'continue') continue;
      if (typeof _ret === 'object') return _ret.v;
    }
    return true;
  }
  function isObjectMatched(obj, matcher) {
    var matcherKeys = Object.keys(matcher);
    for (var i = 0; i < matcherKeys.length; i += 1) {
      var key = matcherKeys[i];
      var value = obj[key];
      if (!isValueMatched(value, matcher[key])) {
        return false;
      }
      continue;
    }
    return true;
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
    trustedSuppressNativeMethod.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default trustedSuppressNativeMethod;

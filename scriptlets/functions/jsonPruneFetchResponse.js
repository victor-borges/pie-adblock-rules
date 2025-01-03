function jsonPruneFetchResponse(source, args) {
  function jsonPruneFetchResponse(source, propsToRemove, obligatoryProps) {
    var propsToMatch = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
    var stack = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
    if (typeof fetch === 'undefined' || typeof Proxy === 'undefined' || typeof Response === 'undefined') {
      return;
    }
    var prunePaths = getPrunePath(propsToRemove);
    var requiredPaths = getPrunePath(obligatoryProps);
    var nativeStringify = window.JSON.stringify;
    var nativeRequestClone = window.Request.prototype.clone;
    var nativeResponseClone = window.Response.prototype.clone;
    var nativeFetch = window.fetch;
    var fetchHandlerWrapper = async function fetchHandlerWrapper(target, thisArg, args) {
      var fetchData = getFetchData(args, nativeRequestClone);
      if (!matchRequestProps(source, propsToMatch, fetchData)) {
        return Reflect.apply(target, thisArg, args);
      }
      var originalResponse;
      var clonedResponse;
      try {
        originalResponse = await nativeFetch.apply(null, args);
        clonedResponse = nativeResponseClone.call(originalResponse);
      } catch (_unused) {
        logMessage(source, 'Could not make an original fetch request: '.concat(fetchData.url));
        return Reflect.apply(target, thisArg, args);
      }
      var json;
      try {
        json = await originalResponse.json();
      } catch (e) {
        var message = "Response body can't be converted to json: ".concat(objectToString(fetchData));
        logMessage(source, message);
        return clonedResponse;
      }
      var modifiedJson = jsonPruner(source, json, prunePaths, requiredPaths, stack, {
        nativeStringify: nativeStringify,
        nativeRequestClone: nativeRequestClone,
        nativeResponseClone: nativeResponseClone,
        nativeFetch: nativeFetch,
      });
      var forgedResponse = forgeResponse(originalResponse, nativeStringify(modifiedJson));
      hit(source);
      return forgedResponse;
    };
    var fetchHandler = {
      apply: fetchHandlerWrapper,
    };
    window.fetch = new Proxy(window.fetch, fetchHandler);
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
  function getFetchData(args, nativeRequestClone) {
    var fetchPropsObj = {};
    var resource = args[0];
    var fetchUrl;
    var fetchInit;
    if (resource instanceof Request) {
      var realData = nativeRequestClone.call(resource);
      var requestData = getRequestData(realData);
      fetchUrl = requestData.url;
      fetchInit = requestData;
    } else {
      fetchUrl = resource;
      fetchInit = args[1];
    }
    fetchPropsObj.url = fetchUrl;
    if (fetchInit instanceof Object) {
      var props = Object.keys(fetchInit);
      props.forEach(function (prop) {
        fetchPropsObj[prop] = fetchInit[prop];
      });
    }
    return fetchPropsObj;
  }
  function objectToString(obj) {
    if (!obj || typeof obj !== 'object') {
      return String(obj);
    }
    if (isEmptyObject(obj)) {
      return '{}';
    }
    return Object.entries(obj)
      .map(function (pair) {
        var key = pair[0];
        var value = pair[1];
        var recordValueStr = value;
        if (value instanceof Object) {
          recordValueStr = '{ '.concat(objectToString(value), ' }');
        }
        return ''.concat(key, ':"').concat(recordValueStr, '"');
      })
      .join(' ');
  }
  function matchRequestProps(source, propsToMatch, requestData) {
    if (propsToMatch === '' || propsToMatch === '*') {
      return true;
    }
    var isMatched;
    var parsedData = parseMatchProps(propsToMatch);
    if (!isValidParsedData(parsedData)) {
      logMessage(source, 'Invalid parameter: '.concat(propsToMatch));
      isMatched = false;
    } else {
      var matchData = getMatchPropsData(parsedData);
      var matchKeys = Object.keys(matchData);
      isMatched = matchKeys.every(function (matchKey) {
        var matchValue = matchData[matchKey];
        var dataValue = requestData[matchKey];
        return (
          Object.prototype.hasOwnProperty.call(requestData, matchKey) &&
          typeof dataValue === 'string' &&
          (matchValue === null || matchValue === void 0 ? void 0 : matchValue.test(dataValue))
        );
      });
    }
    return isMatched;
  }
  function jsonPruner(source, root, prunePaths, requiredPaths, stack, nativeObjects) {
    var nativeStringify = nativeObjects.nativeStringify;
    if (prunePaths.length === 0 && requiredPaths.length === 0) {
      logMessage(
        source,
        ''
          .concat(window.location.hostname, '\n')
          .concat(nativeStringify(root, null, 2), '\nStack trace:\n')
          .concat(new Error().stack),
        true,
      );
      if (root && typeof root === 'object') {
        logMessage(source, root, true, false);
      }
      return root;
    }
    try {
      if (isPruningNeeded(source, root, prunePaths, requiredPaths, stack, nativeObjects) === false) {
        return root;
      }
      prunePaths.forEach(function (path) {
        var ownerObjArr = getWildcardPropertyInChain(root, path, true);
        ownerObjArr.forEach(function (ownerObj) {
          if (ownerObj !== undefined && ownerObj.base) {
            delete ownerObj.base[ownerObj.prop];
            hit(source);
          }
        });
      });
    } catch (e) {
      logMessage(source, e);
    }
    return root;
  }
  function getPrunePath(props) {
    var validPropsString = typeof props === 'string' && props !== undefined && props !== '';
    return validPropsString ? props.split(/ +/) : [];
  }
  function forgeResponse(response, textContent) {
    var bodyUsed = response.bodyUsed,
      headers = response.headers,
      ok = response.ok,
      redirected = response.redirected,
      status = response.status,
      statusText = response.statusText,
      type = response.type,
      url = response.url;
    var forgedResponse = new Response(textContent, {
      status: status,
      statusText: statusText,
      headers: headers,
    });
    Object.defineProperties(forgedResponse, {
      url: {
        value: url,
      },
      type: {
        value: type,
      },
      ok: {
        value: ok,
      },
      bodyUsed: {
        value: bodyUsed,
      },
      redirected: {
        value: redirected,
      },
    });
    return forgedResponse;
  }
  function isPruningNeeded(source, root, prunePaths, requiredPaths, stack, nativeObjects) {
    if (!root) {
      return false;
    }
    var nativeStringify = nativeObjects.nativeStringify;
    var shouldProcess;
    if (prunePaths.length === 0 && requiredPaths.length > 0) {
      var rootString = nativeStringify(root);
      var matchRegex = toRegExp(requiredPaths.join(''));
      var shouldLog = matchRegex.test(rootString);
      if (shouldLog) {
        logMessage(
          source,
          ''
            .concat(window.location.hostname, '\n')
            .concat(nativeStringify(root, null, 2), '\nStack trace:\n')
            .concat(new Error().stack),
          true,
        );
        if (root && typeof root === 'object') {
          logMessage(source, root, true, false);
        }
        shouldProcess = false;
        return shouldProcess;
      }
    }
    if (stack && !matchStackTrace(stack, new Error().stack || '')) {
      shouldProcess = false;
      return shouldProcess;
    }
    var wildcardSymbols = ['.*.', '*.', '.*', '.[].', '[].', '.[]'];
    var _loop = function _loop() {
      var requiredPath = requiredPaths[i];
      var lastNestedPropName = requiredPath.split('.').pop();
      var hasWildcard = wildcardSymbols.some(function (symbol) {
        return requiredPath.includes(symbol);
      });
      var details = getWildcardPropertyInChain(root, requiredPath, hasWildcard);
      if (!details.length) {
        shouldProcess = false;
        return {
          v: shouldProcess,
        };
      }
      shouldProcess = !hasWildcard;
      for (var j = 0; j < details.length; j += 1) {
        var hasRequiredProp = typeof lastNestedPropName === 'string' && details[j].base[lastNestedPropName] !== undefined;
        if (hasWildcard) {
          shouldProcess = hasRequiredProp || shouldProcess;
        } else {
          shouldProcess = hasRequiredProp && shouldProcess;
        }
      }
    };
    for (var i = 0; i < requiredPaths.length; i += 1) {
      var _ret = _loop();
      if (typeof _ret === 'object') return _ret.v;
    }
    return shouldProcess;
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
  function isEmptyObject(obj) {
    return Object.keys(obj).length === 0 && !obj.prototype;
  }
  function getRequestData(request) {
    var requestInitOptions = getRequestProps();
    var entries = requestInitOptions.map(function (key) {
      var value = request[key];
      return [key, value];
    });
    return Object.fromEntries(entries);
  }
  function getRequestProps() {
    return ['url', 'method', 'headers', 'body', 'credentials', 'cache', 'redirect', 'referrer', 'referrerPolicy', 'integrity', 'keepalive', 'signal', 'mode'];
  }
  function parseMatchProps(propsToMatchStr) {
    var PROPS_DIVIDER = ' ';
    var PAIRS_MARKER = ':';
    var isRequestProp = function isRequestProp(prop) {
      return getRequestProps().includes(prop);
    };
    var propsObj = {};
    var props = propsToMatchStr.split(PROPS_DIVIDER);
    props.forEach(function (prop) {
      var dividerInd = prop.indexOf(PAIRS_MARKER);
      var key = prop.slice(0, dividerInd);
      if (isRequestProp(key)) {
        var value = prop.slice(dividerInd + 1);
        propsObj[key] = value;
      } else {
        propsObj.url = prop;
      }
    });
    return propsObj;
  }
  function isValidParsedData(data) {
    return Object.values(data).every(function (value) {
      return isValidStrPattern(value);
    });
  }
  function getMatchPropsData(data) {
    var matchData = {};
    var dataKeys = Object.keys(data);
    dataKeys.forEach(function (key) {
      matchData[key] = toRegExp(data[key]);
    });
    return matchData;
  }
  function getWildcardPropertyInChain(base, chain) {
    var lookThrough = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var output = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
    var pos = chain.indexOf('.');
    if (pos === -1) {
      if (chain === '*' || chain === '[]') {
        for (var key in base) {
          if (Object.prototype.hasOwnProperty.call(base, key)) {
            output.push({
              base: base,
              prop: key,
            });
          }
        }
      } else {
        output.push({
          base: base,
          prop: chain,
        });
      }
      return output;
    }
    var prop = chain.slice(0, pos);
    var shouldLookThrough = (prop === '[]' && Array.isArray(base)) || (prop === '*' && base instanceof Object);
    if (shouldLookThrough) {
      var nextProp = chain.slice(pos + 1);
      var baseKeys = Object.keys(base);
      baseKeys.forEach(function (key) {
        var item = base[key];
        getWildcardPropertyInChain(item, nextProp, lookThrough, output);
      });
    }
    if (Array.isArray(base)) {
      base.forEach(function (key) {
        var nextBase = key;
        if (nextBase !== undefined) {
          getWildcardPropertyInChain(nextBase, chain, lookThrough, output);
        }
      });
    }
    var nextBase = base[prop];
    chain = chain.slice(pos + 1);
    if (nextBase !== undefined) {
      getWildcardPropertyInChain(nextBase, chain, lookThrough, output);
    }
    return output;
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
    jsonPruneFetchResponse.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default jsonPruneFetchResponse;

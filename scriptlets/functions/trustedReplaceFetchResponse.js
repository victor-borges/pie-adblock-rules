function trustedReplaceFetchResponse(source, args) {
  function trustedReplaceFetchResponse(source) {
    var pattern = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var replacement = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    var propsToMatch = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
    if (typeof fetch === 'undefined' || typeof Proxy === 'undefined' || typeof Response === 'undefined') {
      return;
    }
    if (pattern === '' && replacement !== '') {
      logMessage(source, 'Pattern argument should not be empty string');
      return;
    }
    var shouldLog = pattern === '' && replacement === '';
    // var nativeRequestClone = Request.prototype.clone;
    var nativeFetch = fetch;
    var shouldReplace = false;
    var fetchData;
    var handlerWrapper = function handlerWrapper(target, thisArg, args) {
      const fetchPromise = Reflect.apply(target, thisArg, args);
      if (pattern === '') {
        return fetchPromise;
      }
      var nativeRequestClone = Request.prototype.clone;
      fetchData = getFetchData(args, nativeRequestClone);
      if (shouldLog) {
        logMessage(source, 'fetch( '.concat(objectToString(fetchData), ' )'), true);
        hit(source);
        return Reflect.apply(target, thisArg, args);
      }
      shouldReplace = matchRequestProps(source, propsToMatch, fetchData);
      if (!shouldReplace) {
        return fetchPromise;
      }
      return nativeFetch
        .apply(null, args)
        .then(function (responseBefore) {
          const response = responseBefore.clone();
          return response
            .text()
            .then(function (bodyText) {
              if (pattern && pattern.test(textBefore) === false) {
                return responseBefore;
              }
              var patternRegexp = pattern === '*' ? /(\n|.)*/ : toRegExp(pattern);
              var modifiedTextContent = bodyText.replace(patternRegexp, replacement);
              var forgedResponse = forgeResponse(response, modifiedTextContent);
              hit(source);
              return forgedResponse;
            })
            .catch(function () {
              var fetchDataStr = objectToString(fetchData);
              var message = "Response body can't be converted to text: ".concat(fetchDataStr);
              logMessage(source, message);
              return Reflect.apply(target, thisArg, args);
            });
        })
        .catch(function () {
          return Reflect.apply(target, thisArg, args);
        });
    };
    var fetchHandler = {
      apply: handlerWrapper,
    };
    fetch = new Proxy(fetch, fetchHandler);
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
      try {
        var realData = nativeRequestClone.call(resource);
        var requestData = getRequestData(realData);
        fetchUrl = requestData.url;
        fetchInit = requestData;
      } catch (ex) {
        // log('Error', ex);
      }
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
    trustedReplaceFetchResponse.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default trustedReplaceFetchResponse;

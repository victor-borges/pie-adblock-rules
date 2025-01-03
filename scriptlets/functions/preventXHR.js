function preventXHR(source, args) {
  function preventXHR(source, propsToMatch, customResponseText) {
    if (typeof Proxy === 'undefined') {
      return;
    }
    var nativeOpen = window.XMLHttpRequest.prototype.open;
    var nativeSend = window.XMLHttpRequest.prototype.send;
    var nativeGetResponseHeader = window.XMLHttpRequest.prototype.getResponseHeader;
    var nativeGetAllResponseHeaders = window.XMLHttpRequest.prototype.getAllResponseHeaders;
    var xhrData;
    var modifiedResponse = '';
    var modifiedResponseText = '';
    var openWrapper = function openWrapper(target, thisArg, args) {
      xhrData = getXhrData.apply(null, args);
      if (typeof propsToMatch === 'undefined') {
        logMessage(source, 'xhr( '.concat(objectToString(xhrData), ' )'), true);
        hit(source);
      } else if (matchRequestProps(source, propsToMatch, xhrData)) {
        thisArg.shouldBePrevented = true;
        thisArg.xhrData = xhrData;
      }
      if (thisArg.shouldBePrevented) {
        thisArg.collectedHeaders = [];
        var setRequestHeaderWrapper = function setRequestHeaderWrapper(target, thisArg, args) {
          thisArg.collectedHeaders.push(args);
          return Reflect.apply(target, thisArg, args);
        };
        var setRequestHeaderHandler = {
          apply: setRequestHeaderWrapper,
        };
        thisArg.setRequestHeader = new Proxy(thisArg.setRequestHeader, setRequestHeaderHandler);
      }
      return Reflect.apply(target, thisArg, args);
    };
    var sendWrapper = function sendWrapper(target, thisArg, args) {
      if (!thisArg.shouldBePrevented) {
        return Reflect.apply(target, thisArg, args);
      }
      if (thisArg.responseType === 'blob') {
        modifiedResponse = new Blob();
      }
      if (thisArg.responseType === 'arraybuffer') {
        modifiedResponse = new ArrayBuffer();
      }
      if (customResponseText) {
        var randomText = generateRandomResponse(customResponseText);
        if (randomText) {
          modifiedResponseText = randomText;
        } else {
          logMessage(source, "Invalid randomize parameter: '".concat(customResponseText, "'"));
        }
      }
      var forgedRequest = new XMLHttpRequest();
      forgedRequest.addEventListener('readystatechange', function () {
        if (forgedRequest.readyState !== 4) {
          return;
        }
        var readyState = forgedRequest.readyState,
          responseURL = forgedRequest.responseURL,
          responseXML = forgedRequest.responseXML,
          statusText = forgedRequest.statusText;
        Object.defineProperties(thisArg, {
          readyState: {
            value: readyState,
            writable: false,
          },
          statusText: {
            value: statusText,
            writable: false,
          },
          responseURL: {
            value: responseURL || thisArg.xhrData.url,
            writable: false,
          },
          responseXML: {
            value: responseXML,
            writable: false,
          },
          status: {
            value: 200,
            writable: false,
          },
          response: {
            value: modifiedResponse,
            writable: false,
          },
          responseText: {
            value: modifiedResponseText,
            writable: false,
          },
        });
        setTimeout(function () {
          var stateEvent = new Event('readystatechange');
          thisArg.dispatchEvent(stateEvent);
          var loadEvent = new Event('load');
          thisArg.dispatchEvent(loadEvent);
          var loadEndEvent = new Event('loadend');
          thisArg.dispatchEvent(loadEndEvent);
        }, 1);
        hit(source);
      });
      nativeOpen.apply(forgedRequest, [thisArg.xhrData.method, thisArg.xhrData.url]);
      thisArg.collectedHeaders.forEach(function (header) {
        var name = header[0];
        var value = header[1];
        forgedRequest.setRequestHeader(name, value);
      });
      try {
        nativeSend.call(forgedRequest, args);
      } catch (_unused) {
        return Reflect.apply(target, thisArg, args);
      }
      return undefined;
    };
    var getHeaderWrapper = function getHeaderWrapper(target, thisArg, args) {
      if (!thisArg.shouldBePrevented) {
        return nativeGetResponseHeader.apply(thisArg, args);
      }
      if (!thisArg.collectedHeaders.length) {
        return null;
      }
      var searchHeaderName = args[0].toLowerCase();
      var matchedHeader = thisArg.collectedHeaders.find(function (header) {
        var headerName = header[0].toLowerCase();
        return headerName === searchHeaderName;
      });
      return matchedHeader ? matchedHeader[1] : null;
    };
    var getAllHeadersWrapper = function getAllHeadersWrapper(target, thisArg) {
      if (!thisArg.shouldBePrevented) {
        return nativeGetAllResponseHeaders.call(thisArg);
      }
      if (!thisArg.collectedHeaders.length) {
        return '';
      }
      var allHeadersStr = thisArg.collectedHeaders
        .map(function (header) {
          var headerName = header[0];
          var headerValue = header[1];
          return ''.concat(headerName.toLowerCase(), ': ').concat(headerValue);
        })
        .join('\r\n');
      return allHeadersStr;
    };
    var openHandler = {
      apply: openWrapper,
    };
    var sendHandler = {
      apply: sendWrapper,
    };
    var getHeaderHandler = {
      apply: getHeaderWrapper,
    };
    var getAllHeadersHandler = {
      apply: getAllHeadersWrapper,
    };
    XMLHttpRequest.prototype.open = new Proxy(XMLHttpRequest.prototype.open, openHandler);
    XMLHttpRequest.prototype.send = new Proxy(XMLHttpRequest.prototype.send, sendHandler);
    XMLHttpRequest.prototype.getResponseHeader = new Proxy(XMLHttpRequest.prototype.getResponseHeader, getHeaderHandler);
    XMLHttpRequest.prototype.getAllResponseHeaders = new Proxy(XMLHttpRequest.prototype.getAllResponseHeaders, getAllHeadersHandler);
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
  function generateRandomResponse(customResponseText) {
    var customResponse = customResponseText;
    if (customResponse === 'true') {
      customResponse = Math.random().toString(36).slice(-10);
      return customResponse;
    }
    customResponse = customResponse.replace('length:', '');
    var rangeRegex = /^\d+-\d+$/;
    if (!rangeRegex.test(customResponse)) {
      return null;
    }
    var rangeMin = getNumberFromString(customResponse.split('-')[0]);
    var rangeMax = getNumberFromString(customResponse.split('-')[1]);
    if (!nativeIsFinite(rangeMin) || !nativeIsFinite(rangeMax)) {
      return null;
    }
    if (rangeMin > rangeMax) {
      var temp = rangeMin;
      rangeMin = rangeMax;
      rangeMax = temp;
    }
    var LENGTH_RANGE_LIMIT = 500 * 1e3;
    if (rangeMax > LENGTH_RANGE_LIMIT) {
      return null;
    }
    var length = getRandomIntInclusive(rangeMin, rangeMax);
    customResponse = getRandomStrByLength(length);
    return customResponse;
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
  function getXhrData(method, url, async, user, password) {
    return {
      method: method,
      url: url,
      async: async,
      user: user,
      password: password,
    };
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
  function getNumberFromString(rawString) {
    var parsedDelay = parseInt(rawString, 10);
    var validDelay = nativeIsNaN(parsedDelay) ? null : parsedDelay;
    return validDelay;
  }
  function nativeIsFinite(num) {
    var native = Number.isFinite || window.isFinite;
    return native(num);
  }
  function nativeIsNaN(num) {
    var native = Number.isNaN || window.isNaN;
    return native(num);
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
  function getRequestProps() {
    return ['url', 'method', 'headers', 'body', 'credentials', 'cache', 'redirect', 'referrer', 'referrerPolicy', 'integrity', 'keepalive', 'signal', 'mode'];
  }
  function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  function getRandomStrByLength(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+=~';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i += 1) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
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
    preventXHR.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default preventXHR;

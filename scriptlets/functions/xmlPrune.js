function xmlPrune(source, args) {
  return; // breaking hulu totally
  function xmlPrune(source, propsToRemove) {
    var optionalProp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    var urlToMatch = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
    if (typeof Reflect === 'undefined' || typeof fetch === 'undefined' || typeof Proxy === 'undefined' || typeof Response === 'undefined') {
      return;
    }
    var shouldPruneResponse = false;
    var urlMatchRegexp = toRegExp(urlToMatch);
    var XPATH_MARKER = 'xpath(';
    var isXpath = propsToRemove && propsToRemove.startsWith(XPATH_MARKER);
    var getXPathElements = function getXPathElements(contextNode) {
      var matchedElements = [];
      try {
        var elementsToRemove = propsToRemove.slice(XPATH_MARKER.length, -1);
        var xpathResult = contextNode.evaluate(elementsToRemove, contextNode, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var i = 0; i < xpathResult.snapshotLength; i += 1) {
          matchedElements.push(xpathResult.snapshotItem(i));
        }
      } catch (ex) {
        var message = 'Invalid XPath parameter: '.concat(propsToRemove, '\n').concat(ex);
        logMessage(source, message);
      }
      return matchedElements;
    };
    var xPathPruning = function xPathPruning(xPathElements) {
      xPathElements.forEach(function (element) {
        if (element.nodeType === 1) {
          element.remove();
        } else if (element.nodeType === 2) {
          element.ownerElement.removeAttribute(element.nodeName);
        }
      });
    };
    var isXML = function isXML(text) {
      if (typeof text === 'string') {
        var trimmedText = text.trim();
        if (trimmedText.startsWith('<') && trimmedText.endsWith('>')) {
          return true;
        }
      }
      return false;
    };
    var createXMLDocument = function createXMLDocument(text) {
      var xmlParser = new DOMParser();
      var xmlDocument = xmlParser.parseFromString(text, 'text/xml');
      return xmlDocument;
    };
    var isPruningNeeded = function isPruningNeeded(response, propsToRemove) {
      if (!isXML(response)) {
        return false;
      }
      var docXML = createXMLDocument(response);
      return isXpath ? getXPathElements(docXML) : !!docXML.querySelector(propsToRemove);
    };
    var pruneXML = function pruneXML(text) {
      if (!isXML(text)) {
        shouldPruneResponse = false;
        return text;
      }
      var xmlDoc = createXMLDocument(text);
      var errorNode = xmlDoc.querySelector('parsererror');
      if (errorNode) {
        return text;
      }
      if (optionalProp !== '' && xmlDoc.querySelector(optionalProp) === null) {
        shouldPruneResponse = false;
        return text;
      }
      var elements = isXpath ? getXPathElements(xmlDoc) : xmlDoc.querySelectorAll(propsToRemove);
      if (!elements.length) {
        shouldPruneResponse = false;
        return text;
      }
      if (isXpath) {
        xPathPruning(elements);
      } else {
        elements.forEach(function (elem) {
          elem.remove();
        });
      }
      var serializer = new XMLSerializer();
      text = serializer.serializeToString(xmlDoc);
      return text;
    };
    var nativeOpen = window.XMLHttpRequest.prototype.open;
    var nativeSend = window.XMLHttpRequest.prototype.send;
    var xhrData;
    var openWrapper = function openWrapper(target, thisArg, args) {
      xhrData = getXhrData.apply(null, args);
      if (matchRequestProps(source, urlToMatch, xhrData)) {
        thisArg.shouldBePruned = true;
      }
      if (thisArg.shouldBePruned) {
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
      var allowedResponseTypeValues = ['', 'text'];
      if (!thisArg.shouldBePruned || !allowedResponseTypeValues.includes(thisArg.responseType)) {
        return Reflect.apply(target, thisArg, args);
      }
      var forgedRequest = new XMLHttpRequest();
      forgedRequest.addEventListener('readystatechange', function () {
        if (forgedRequest.readyState !== 4) {
          return;
        }
        var readyState = forgedRequest.readyState,
          response = forgedRequest.response,
          responseText = forgedRequest.responseText,
          responseURL = forgedRequest.responseURL,
          responseXML = forgedRequest.responseXML,
          status = forgedRequest.status,
          statusText = forgedRequest.statusText;
        var content = responseText || response;
        if (typeof content !== 'string') {
          return;
        }
        if (!propsToRemove) {
          if (isXML(response)) {
            var message = 'XMLHttpRequest.open() URL: '.concat(responseURL, '\nresponse: ').concat(response);
            logMessage(source, message);
            logMessage(source, createXMLDocument(response), true, false);
          }
        } else {
          shouldPruneResponse = isPruningNeeded(response, propsToRemove);
        }
        var responseContent = shouldPruneResponse ? pruneXML(response) : response;
        Object.defineProperties(thisArg, {
          readyState: {
            value: readyState,
            writable: false,
          },
          responseURL: {
            value: responseURL,
            writable: false,
          },
          responseXML: {
            value: responseXML,
            writable: false,
          },
          status: {
            value: status,
            writable: false,
          },
          statusText: {
            value: statusText,
            writable: false,
          },
          response: {
            value: responseContent,
            writable: false,
          },
          responseText: {
            value: responseContent,
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
      nativeOpen.apply(forgedRequest, [xhrData.method, xhrData.url]);
      thisArg.collectedHeaders.forEach(function (header) {
        var name = header[0];
        var value = header[1];
        forgedRequest.setRequestHeader(name, value);
      });
      thisArg.collectedHeaders = [];
      try {
        nativeSend.call(forgedRequest, args);
      } catch (_unused) {
        return Reflect.apply(target, thisArg, args);
      }
      return undefined;
    };
    var openHandler = {
      apply: openWrapper,
    };
    var sendHandler = {
      apply: sendWrapper,
    };
    XMLHttpRequest.prototype.open = new Proxy(XMLHttpRequest.prototype.open, openHandler);
    XMLHttpRequest.prototype.send = new Proxy(XMLHttpRequest.prototype.send, sendHandler);
    var nativeFetch = window.fetch;
    var fetchWrapper = async function fetchWrapper(target, thisArg, args) {
      var fetchURL = args[0] instanceof Request ? args[0].url : args[0];
      if (typeof fetchURL !== 'string' || fetchURL.length === 0) {
        return Reflect.apply(target, thisArg, args);
      }
      if (urlMatchRegexp.test(fetchURL)) {
        var response = await nativeFetch(...args);
        var clonedResponse = response.clone();
        var responseText = await response.text();
        shouldPruneResponse = isPruningNeeded(responseText, propsToRemove);
        if (!shouldPruneResponse) {
          var message = 'fetch URL: '.concat(fetchURL, '\nresponse text: ').concat(responseText);
          logMessage(source, message);
          logMessage(source, createXMLDocument(responseText), true, false);
          return clonedResponse;
        }
        var prunedText = pruneXML(responseText);
        if (shouldPruneResponse) {
          hit(source);
          return new Response(prunedText, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        }
        return clonedResponse;
      }
      return Reflect.apply(target, thisArg, args);
    };
    var fetchHandler = {
      apply: fetchWrapper,
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
  function getXhrData(method, url, async, user, password) {
    return {
      method: method,
      url: url,
      async: async,
      user: user,
      password: password,
    };
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
  function isValidParsedData(data) {
    return Object.values(data).every(function (value) {
      return isValidStrPattern(value);
    });
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
}

export default xmlPrune;

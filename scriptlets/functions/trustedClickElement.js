function trustedClickElement(source, args) {
  function trustedClickElement(source, selectors) {
    var extraMatch = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    var delay = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : NaN;
    if (!selectors) {
      return;
    }
    var OBSERVER_TIMEOUT_MS = 1e4;
    var THROTTLE_DELAY_MS = 20;
    var STATIC_CLICK_DELAY_MS = 150;
    var COOKIE_MATCH_MARKER = 'cookie:';
    var LOCAL_STORAGE_MATCH_MARKER = 'localStorage:';
    var SELECTORS_DELIMITER = ',';
    var COOKIE_STRING_DELIMITER = ';';
    var EXTRA_MATCH_DELIMITER = /(,\s*){1}(?=!?cookie:|!?localStorage:)/;
    var sleep = function sleep(delayMs) {
      return new Promise(function (resolve) {
        return setTimeout(resolve, delayMs);
      });
    };
    var parsedDelay;
    if (delay) {
      parsedDelay = parseInt(delay, 10);
      var isValidDelay = !Number.isNaN(parsedDelay) || parsedDelay < OBSERVER_TIMEOUT_MS;
      if (!isValidDelay) {
        var message = "Passed delay '".concat(delay, "' is invalid or bigger than ").concat(OBSERVER_TIMEOUT_MS, ' ms');
        logMessage(source, message);
        return;
      }
    }
    var canClick = !parsedDelay;
    var cookieMatches = [];
    var localStorageMatches = [];
    var isInvertedMatchCookie = false;
    var isInvertedMatchLocalStorage = false;
    if (extraMatch) {
      var parsedExtraMatch = extraMatch.split(EXTRA_MATCH_DELIMITER).map(function (matchStr) {
        return matchStr.trim();
      });
      parsedExtraMatch.forEach(function (matchStr) {
        if (matchStr.includes(COOKIE_MATCH_MARKER)) {
          var _parseMatchArg = parseMatchArg(matchStr),
            isInvertedMatch = _parseMatchArg.isInvertedMatch,
            matchValue = _parseMatchArg.matchValue;
          isInvertedMatchCookie = isInvertedMatch;
          var cookieMatch = matchValue.replace(COOKIE_MATCH_MARKER, '');
          cookieMatches.push(cookieMatch);
        }
        if (matchStr.includes(LOCAL_STORAGE_MATCH_MARKER)) {
          var _parseMatchArg2 = parseMatchArg(matchStr),
            _isInvertedMatch = _parseMatchArg2.isInvertedMatch,
            _matchValue = _parseMatchArg2.matchValue;
          isInvertedMatchLocalStorage = _isInvertedMatch;
          var localStorageMatch = _matchValue.replace(LOCAL_STORAGE_MATCH_MARKER, '');
          localStorageMatches.push(localStorageMatch);
        }
      });
    }
    if (cookieMatches.length > 0) {
      var parsedCookieMatches = parseCookieString(cookieMatches.join(COOKIE_STRING_DELIMITER));
      var parsedCookies = parseCookieString(document.cookie);
      var cookieKeys = Object.keys(parsedCookies);
      if (cookieKeys.length === 0) {
        return;
      }
      var cookiesMatched = Object.keys(parsedCookieMatches).every(function (key) {
        var valueMatch = parsedCookieMatches[key] ? toRegExp(parsedCookieMatches[key]) : null;
        var keyMatch = toRegExp(key);
        return cookieKeys.some(function (key) {
          var keysMatched = keyMatch.test(key);
          if (!keysMatched) {
            return false;
          }
          if (!valueMatch) {
            return true;
          }
          return valueMatch.test(parsedCookies[key]);
        });
      });
      var shouldRun = cookiesMatched !== isInvertedMatchCookie;
      if (!shouldRun) {
        return;
      }
    }
    if (localStorageMatches.length > 0) {
      var localStorageMatched = localStorageMatches.every(function (str) {
        var itemValue = window.localStorage.getItem(str);
        return itemValue || itemValue === '';
      });
      var _shouldRun = localStorageMatched !== isInvertedMatchLocalStorage;
      if (!_shouldRun) {
        return;
      }
    }
    var selectorsSequence = selectors.split(SELECTORS_DELIMITER).map(function (selector) {
      return selector.trim();
    });
    var createElementObj = function createElementObj(element) {
      return {
        element: element || null,
        clicked: false,
      };
    };
    var elementsSequence = Array(selectorsSequence.length).fill(createElementObj());
    var clickElementsBySequence = async function clickElementsBySequence() {
      for (var i = 0; i < elementsSequence.length; i += 1) {
        var elementObj = elementsSequence[i];
        if (i >= 1) {
          await sleep(STATIC_CLICK_DELAY_MS);
        }
        if (!elementObj.element) {
          break;
        }
        if (!elementObj.clicked) {
          elementObj.element.click();
          elementObj.clicked = true;
        }
      }
      var allElementsClicked = elementsSequence.every(function (elementObj) {
        return elementObj.clicked === true;
      });
      if (allElementsClicked) {
        hit(source);
      }
    };
    var handleElement = function handleElement(element, i) {
      var elementObj = createElementObj(element);
      elementsSequence[i] = elementObj;
      if (canClick) {
        clickElementsBySequence();
      }
    };
    var findElements = function findElements(mutations, observer) {
      var fulfilledSelectors = [];
      selectorsSequence.forEach(function (selector, i) {
        if (!selector) {
          return;
        }
        var element = queryShadowSelector(selector);
        if (!element) {
          return;
        }
        handleElement(element, i);
        fulfilledSelectors.push(selector);
      });
      selectorsSequence = selectorsSequence.map(function (selector) {
        return fulfilledSelectors.includes(selector) ? null : selector;
      });
      var allSelectorsFulfilled = selectorsSequence.every(function (selector) {
        return selector === null;
      });
      if (allSelectorsFulfilled) {
        observer.disconnect();
      }
    };
    var observer = new MutationObserver(throttle(findElements, THROTTLE_DELAY_MS));
    observer.observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    if (parsedDelay) {
      setTimeout(function () {
        clickElementsBySequence();
        canClick = true;
      }, parsedDelay);
    }
    setTimeout(function () {
      return observer.disconnect();
    }, OBSERVER_TIMEOUT_MS);
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
  function parseCookieString(cookieString) {
    var COOKIE_DELIMITER = '=';
    var COOKIE_PAIRS_DELIMITER = ';';
    var cookieChunks = cookieString.split(COOKIE_PAIRS_DELIMITER);
    var cookieData = {};
    cookieChunks.forEach(function (singleCookie) {
      var cookieKey;
      var cookieValue = '';
      var delimiterIndex = singleCookie.indexOf(COOKIE_DELIMITER);
      if (delimiterIndex === -1) {
        cookieKey = singleCookie.trim();
      } else {
        cookieKey = singleCookie.slice(0, delimiterIndex).trim();
        cookieValue = singleCookie.slice(delimiterIndex + 1);
      }
      cookieData[cookieKey] = cookieValue || null;
    });
    return cookieData;
  }
  function throttle(cb, delay) {
    var wait = false;
    var savedArgs;
    var wrapper = function wrapper() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      if (wait) {
        savedArgs = args;
        return;
      }
      cb(...args);
      wait = true;
      setTimeout(function () {
        wait = false;
        if (savedArgs) {
          wrapper(...savedArgs);
          savedArgs = null;
        }
      }, delay);
    };
    return wrapper;
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
  function queryShadowSelector(selector) {
    var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.documentElement;
    var SHADOW_COMBINATOR = ' >>> ';
    var pos = selector.indexOf(SHADOW_COMBINATOR);
    if (pos === -1) {
      return context.querySelector(selector);
    }
    var shadowHostSelector = selector.slice(0, pos).trim();
    var elem = context.querySelector(shadowHostSelector);
    if (!elem || !elem.shadowRoot) {
      return null;
    }
    var shadowRootSelector = selector.slice(pos + SHADOW_COMBINATOR.length).trim();
    return queryShadowSelector(shadowRootSelector, elem.shadowRoot);
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
    trustedClickElement.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default trustedClickElement;

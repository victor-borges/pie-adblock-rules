function trustedCreateElement(source, args) {
  function trustedCreateElement(source, parentSelector, tagName) {
    var attributePairs = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
    var textContent = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
    var cleanupDelayMs = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : NaN;
    if (!parentSelector || !tagName) {
      return;
    }
    var IFRAME_WINDOW_NAME = 'trusted-create-element-window';
    if (window.name === IFRAME_WINDOW_NAME) {
      return;
    }
    var logError = function logError(prefix, error) {
      logMessage(source, ''.concat(prefix, ' due to ').concat(getErrorMessage(error)));
    };
    var element;
    try {
      element = document.createElement(tagName);
      element.textContent = textContent;
    } catch (e) {
      logError("Cannot create element with tag name '".concat(tagName, "'"), e);
      return;
    }
    var attributes = [];
    try {
      attributes = parseAttributePairs(attributePairs);
    } catch (e) {
      logError("Cannot parse attributePairs param: '".concat(attributePairs, "'"), e);
      return;
    }
    attributes.forEach(function (attr) {
      try {
        element.setAttribute(attr.name, attr.value);
      } catch (e) {
        logError("Cannot set attribute '".concat(attr.name, "' with value '").concat(attr.value, "'"), e);
      }
    });
    var timerId;
    var findParentAndAppendEl = function findParentAndAppendEl(parentElSelector, el, removeElDelayMs) {
      var parentEl;
      try {
        parentEl = document.querySelector(parentElSelector);
      } catch (e) {
        logError("Cannot find parent element by selector '".concat(parentElSelector, "'"), e);
        return false;
      }
      if (!parentEl) {
        logMessage(source, "No parent element found by selector: '".concat(parentElSelector, "'"));
        return false;
      }
      try {
        parentEl.append(el);
        if (el instanceof HTMLIFrameElement && el.contentWindow) {
          el.contentWindow.name = IFRAME_WINDOW_NAME;
        }
        hit(source);
      } catch (e) {
        logError("Cannot append child to parent by selector '".concat(parentElSelector, "'"), e);
        return false;
      }
      if (!nativeIsNaN(removeElDelayMs)) {
        timerId = setTimeout(function () {
          el.remove();
          clearTimeout(timerId);
        }, removeElDelayMs);
      }
      return true;
    };
    if (!findParentAndAppendEl(parentSelector, element, cleanupDelayMs)) {
      observeDocumentWithTimeout(function (mutations, observer) {
        if (findParentAndAppendEl(parentSelector, element, cleanupDelayMs)) {
          observer.disconnect();
        }
      });
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
  function observeDocumentWithTimeout(callback) {
    var options =
      arguments.length > 1 && arguments[1] !== undefined
        ? arguments[1]
        : {
            subtree: true,
            childList: true,
          };
    var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1e4;
    var documentObserver = new MutationObserver(function (mutations, observer) {
      observer.disconnect();
      callback(mutations, observer);
      observer.observe(document.documentElement, options);
    });
    documentObserver.observe(document.documentElement, options);
    if (typeof timeout === 'number') {
      setTimeout(function () {
        return documentObserver.disconnect();
      }, timeout);
    }
  }
  function nativeIsNaN(num) {
    var native = Number.isNaN || window.isNaN;
    return native(num);
  }
  function parseAttributePairs(input) {
    if (!input) {
      return [];
    }
    var NAME_VALUE_SEPARATOR = '=';
    var PAIRS_SEPARATOR = ' ';
    var SINGLE_QUOTE = "'";
    var DOUBLE_QUOTE = '"';
    var BACKSLASH = '\\';
    var pairs = [];
    for (var i = 0; i < input.length; i += 1) {
      var name = '';
      var value = '';
      while (i < input.length && input[i] !== NAME_VALUE_SEPARATOR && input[i] !== PAIRS_SEPARATOR) {
        name += input[i];
        i += 1;
      }
      if (i < input.length && input[i] === NAME_VALUE_SEPARATOR) {
        i += 1;
        var quote = null;
        if (input[i] === SINGLE_QUOTE || input[i] === DOUBLE_QUOTE) {
          quote = input[i];
          i += 1;
          for (; i < input.length; i += 1) {
            if (input[i] === quote) {
              if (input[i - 1] === BACKSLASH) {
                value = ''.concat(value.slice(0, -1)).concat(quote);
              } else {
                i += 1;
                quote = null;
                break;
              }
            } else {
              value += input[i];
            }
          }
          if (quote !== null) {
            throw new Error("Unbalanced quote for attribute value: '".concat(input, "'"));
          }
        } else {
          throw new Error('Attribute value should be quoted: "'.concat(input.slice(i), '"'));
        }
      }
      name = name.trim();
      value = value.trim();
      if (!name) {
        if (!value) {
          continue;
        }
        throw new Error("Attribute name before '=' should be specified: '".concat(input, "'"));
      }
      pairs.push({
        name: name,
        value: value,
      });
      if (input[i] && input[i] !== PAIRS_SEPARATOR) {
        throw new Error("No space before attribute: '".concat(input.slice(i), "'"));
      }
    }
    return pairs;
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
    trustedCreateElement.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default trustedCreateElement;

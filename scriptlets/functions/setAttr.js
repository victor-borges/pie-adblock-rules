function setAttr(source, args) {
  function setAttr(source, selector, attr) {
    var value = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
    if (!selector || !attr) {
      return;
    }
    var allowedValues = ['true', 'false'];
    var shouldCopyValue = value.startsWith('[') && value.endsWith(']');
    var isValidValue =
      value.length === 0 ||
      (!nativeIsNaN(parseInt(value, 10)) && parseInt(value, 10) > 0 && parseInt(value, 10) < 32767) ||
      allowedValues.includes(value.toLowerCase());
    if (!shouldCopyValue && !isValidValue) {
      logMessage(source, "Invalid attribute value provided: '".concat(convertTypeToString(value), "'"));
      return;
    }
    var attributeHandler;
    if (shouldCopyValue) {
      attributeHandler = function attributeHandler(elem, attr, value) {
        var valueToCopy = elem.getAttribute(value.slice(1, -1));
        if (valueToCopy === null) {
          logMessage(source, 'No element attribute found to copy value from: '.concat(value));
        }
        elem.setAttribute(attr, valueToCopy);
      };
    }
    setAttributeBySelector(source, selector, attr, value, attributeHandler);
    observeDOMChanges(function () {
      return setAttributeBySelector(source, selector, attr, value, attributeHandler);
    }, true);
  }
  function setAttributeBySelector(source, selector, attribute, value) {
    var attributeSetter = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : defaultAttributeSetter;
    var elements;
    try {
      elements = document.querySelectorAll(selector);
    } catch (_unused) {
      logMessage(source, 'Failed to find elements matching selector "'.concat(selector, '"'));
      return;
    }
    if (!elements || elements.length === 0) {
      return;
    }
    try {
      elements.forEach(function (elem) {
        return attributeSetter(elem, attribute, value);
      });
      hit(source);
    } catch (_unused2) {
      logMessage(source, 'Failed to set ['.concat(attribute, '="').concat(value, '"] to each of selected elements.'));
    }
  }
  function observeDOMChanges(callback) {
    var observeAttrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var attrsToObserve = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    var THROTTLE_DELAY_MS = 20;
    var observer = new MutationObserver(throttle(callbackWrapper, THROTTLE_DELAY_MS));
    var connect = function connect() {
      if (attrsToObserve.length > 0) {
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
          attributes: observeAttrs,
          attributeFilter: attrsToObserve,
        });
      } else {
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
          attributes: observeAttrs,
        });
      }
    };
    var disconnect = function disconnect() {
      observer.disconnect();
    };
    function callbackWrapper() {
      disconnect();
      callback();
      connect();
    }
    connect();
  }
  function nativeIsNaN(num) {
    var native = Number.isNaN || window.isNaN;
    return native(num);
  }
  function convertTypeToString(value) {
    var output;
    if (typeof value === 'undefined') {
      output = 'undefined';
    } else if (typeof value === 'object') {
      if (value === null) {
        output = 'null';
      } else {
        output = objectToString(value);
      }
    } else {
      output = String(value);
    }
    return output;
  }
  function defaultAttributeSetter(elem, attribute, value) {
    return elem.setAttribute(attribute, value);
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
    setAttr.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default setAttr;

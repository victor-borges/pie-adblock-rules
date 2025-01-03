function removeClass(source, args) {
  function removeClass(source, classNames, selector) {
    var applying = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'asap stay';
    if (!classNames) {
      return;
    }
    classNames = classNames.split(/\s*\|\s*/);
    var selectors = [];
    if (!selector) {
      selectors = classNames.map(function (className) {
        return '.'.concat(className);
      });
    }
    var removeClassHandler = function removeClassHandler() {
      var nodes = new Set();
      if (selector) {
        var foundNodes = [];
        try {
          foundNodes = [].slice.call(document.querySelectorAll(selector));
        } catch (e) {
          logMessage(source, "Invalid selector arg: '".concat(selector, "'"));
        }
        foundNodes.forEach(function (n) {
          return nodes.add(n);
        });
      } else if (selectors.length > 0) {
        selectors.forEach(function (s) {
          var elements = document.querySelectorAll(s);
          for (var i = 0; i < elements.length; i += 1) {
            var element = elements[i];
            nodes.add(element);
          }
        });
      }
      var removed = false;
      nodes.forEach(function (node) {
        classNames.forEach(function (className) {
          if (node.classList.contains(className)) {
            node.classList.remove(className);
            removed = true;
          }
        });
      });
      if (removed) {
        hit(source);
      }
    };
    var CLASS_ATTR_NAME = ['class'];
    var flags = parseFlags(applying);
    var run = function run() {
      removeClassHandler();
      if (!flags.hasFlag(flags.STAY)) {
        return;
      }
      observeDOMChanges(removeClassHandler, true, CLASS_ATTR_NAME);
    };
    if (flags.hasFlag(flags.ASAP)) {
      if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', removeClassHandler, {
          once: true,
        });
      } else {
        removeClassHandler();
      }
    }
    if (document.readyState !== 'complete' && flags.hasFlag(flags.COMPLETE)) {
      window.addEventListener('load', run, {
        once: true,
      });
    } else if (flags.hasFlag(flags.STAY)) {
      if (!applying.includes(' ')) {
        removeClassHandler();
      }
      observeDOMChanges(removeClassHandler, true, CLASS_ATTR_NAME);
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
  function parseFlags(flags) {
    var FLAGS_DIVIDER = ' ';
    var ASAP_FLAG = 'asap';
    var COMPLETE_FLAG = 'complete';
    var STAY_FLAG = 'stay';
    var VALID_FLAGS = [STAY_FLAG, ASAP_FLAG, COMPLETE_FLAG];
    var passedFlags = flags
      .trim()
      .split(FLAGS_DIVIDER)
      .filter(function (f) {
        return VALID_FLAGS.includes(f);
      });
    return {
      ASAP: ASAP_FLAG,
      COMPLETE: COMPLETE_FLAG,
      STAY: STAY_FLAG,
      hasFlag(flag) {
        return passedFlags.includes(flag);
      },
    };
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
    removeClass.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default removeClass;

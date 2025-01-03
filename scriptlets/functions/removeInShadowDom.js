function removeInShadowDom(source, args) {
  function removeInShadowDom(source, selector, baseSelector) {
    if (!Element.prototype.attachShadow) {
      return;
    }
    var removeElement = function removeElement(targetElement) {
      targetElement.remove();
    };
    var removeHandler = function removeHandler() {
      var hostElements = !baseSelector ? findHostElements(document.documentElement) : document.querySelectorAll(baseSelector);
      var _loop = function _loop() {
        var isRemoved = false;
        var _pierceShadowDom = pierceShadowDom(selector, hostElements),
          targets = _pierceShadowDom.targets,
          innerHosts = _pierceShadowDom.innerHosts;
        targets.forEach(function (targetEl) {
          removeElement(targetEl);
          isRemoved = true;
        });
        if (isRemoved) {
          hit(source);
        }
        hostElements = innerHosts;
      };
      while (hostElements.length !== 0) {
        _loop();
      }
    };
    removeHandler();
    observeDOMChanges(removeHandler, true);
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
  function findHostElements(rootElement) {
    var hosts = [];
    if (rootElement) {
      var domElems = rootElement.querySelectorAll('*');
      domElems.forEach(function (el) {
        if (el.shadowRoot) {
          hosts.push(el);
        }
      });
    }
    return hosts;
  }
  function pierceShadowDom(selector, hostElements) {
    var targets = [];
    var innerHostsAcc = [];
    hostElements.forEach(function (host) {
      var simpleElems = host.querySelectorAll(selector);
      targets = targets.concat([].slice.call(simpleElems));
      var shadowRootElem = host.shadowRoot;
      var shadowChildren = shadowRootElem.querySelectorAll(selector);
      targets = targets.concat([].slice.call(shadowChildren));
      innerHostsAcc.push(findHostElements(shadowRootElem));
    });
    var innerHosts = flatten(innerHostsAcc);
    return {
      targets: targets,
      innerHosts: innerHosts,
    };
  }
  function flatten(input) {
    var stack = [];
    input.forEach(function (el) {
      return stack.push(el);
    });
    var res = [];
    while (stack.length) {
      var next = stack.pop();
      if (Array.isArray(next)) {
        next.forEach(function (el) {
          return stack.push(el);
        });
      } else {
        res.push(next);
      }
    }
    return res.reverse();
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
    removeInShadowDom.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default removeInShadowDom;

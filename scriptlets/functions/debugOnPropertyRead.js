function debugOnPropertyRead(source, args) {
  function debugOnPropertyRead(source, property) {
    if (!property) {
      return;
    }
    var rid = randomId();
    var abort = function abort() {
      hit(source);
      debugger;
    };
    var setChainPropAccess = function setChainPropAccess(owner, property) {
      var chainInfo = getPropertyInChain(owner, property);
      var base = chainInfo.base;
      var prop = chainInfo.prop,
        chain = chainInfo.chain;
      if (chain) {
        var setter = function setter(a) {
          base = a;
          if (a instanceof Object) {
            setChainPropAccess(a, chain);
          }
        };
        Object.defineProperty(owner, prop, {
          get: function get() {
            return base;
          },
          set: setter,
        });
        return;
      }
      setPropertyAccess(base, prop, {
        get: abort,
        set: noopFunc,
      });
    };
    setChainPropAccess(window, property);
    window.onerror = createOnErrorHandler(rid).bind();
  }
  function randomId() {
    return Math.random().toString(36).slice(2, 9);
  }
  function setPropertyAccess(object, property, descriptor) {
    var currentDescriptor = Object.getOwnPropertyDescriptor(object, property);
    if (currentDescriptor && !currentDescriptor.configurable) {
      return false;
    }
    Object.defineProperty(object, property, descriptor);
    return true;
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
  function noopFunc() {}
  function isEmptyObject(obj) {
    return Object.keys(obj).length === 0 && !obj.prototype;
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
    debugOnPropertyRead.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default debugOnPropertyRead;

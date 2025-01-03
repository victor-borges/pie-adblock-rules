function abortCurrentInlineScript(source, args) {
  function abortCurrentInlineScript(source, property, search) {
    var searchRegexp = toRegExp(search);
    var rid = randomId();
    var SRC_DATA_MARKER = 'data:text/javascript;base64,';
    var getCurrentScript = function getCurrentScript() {
      if ('currentScript' in document) {
        return document.currentScript;
      }
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    };
    var ourScript = getCurrentScript();
    var abort = function abort() {
      var _scriptEl$src;
      var scriptEl = getCurrentScript();
      if (!scriptEl) {
        return;
      }
      var content = scriptEl.textContent;
      try {
        var textContentGetter = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent').get;
        content = textContentGetter.call(scriptEl);
      } catch (e) {}
      if (
        content.length === 0 &&
        typeof scriptEl.src !== 'undefined' &&
        (_scriptEl$src = scriptEl.src) !== null &&
        _scriptEl$src !== void 0 &&
        _scriptEl$src.startsWith(SRC_DATA_MARKER)
      ) {
        var encodedContent = scriptEl.src.slice(SRC_DATA_MARKER.length);
        content = window.atob(encodedContent);
      }
      if (scriptEl instanceof HTMLScriptElement && content.length > 0 && scriptEl !== ourScript && searchRegexp.test(content)) {
        hit(source);
        throw new ReferenceError(rid);
      }
    };
    var setChainPropAccess = function setChainPropAccess(owner, property) {
      var chainInfo = getPropertyInChain(owner, property);
      var base = chainInfo.base;
      var prop = chainInfo.prop,
        chain = chainInfo.chain;
      if (base instanceof Object === false && base === null) {
        var props = property.split('.');
        var propIndex = props.indexOf(prop);
        var baseName = props[propIndex - 1];
        var message = 'The scriptlet had been executed before the '.concat(baseName, ' was loaded.');
        logMessage(source, message);
        return;
      }
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
      var currentValue = base[prop];
      var origDescriptor = Object.getOwnPropertyDescriptor(base, prop);
      if (origDescriptor instanceof Object === false || origDescriptor.get instanceof Function === false) {
        currentValue = base[prop];
        origDescriptor = undefined;
      }
      var descriptorWrapper = Object.assign(getDescriptorAddon(), {
        currentValue: currentValue,
        get() {
          if (!this.isAbortingSuspended) {
            this.isolateCallback(abort);
          }
          if (origDescriptor instanceof Object) {
            return origDescriptor.get.call(base);
          }
          return this.currentValue;
        },
        set(newValue) {
          if (!this.isAbortingSuspended) {
            this.isolateCallback(abort);
          }
          if (origDescriptor instanceof Object) {
            origDescriptor.set.call(base, newValue);
          } else {
            this.currentValue = newValue;
          }
        },
      });
      setPropertyAccess(base, prop, {
        get() {
          return descriptorWrapper.get.call(descriptorWrapper);
        },
        set(newValue) {
          descriptorWrapper.set.call(descriptorWrapper, newValue);
        },
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
  function isEmptyObject(obj) {
    return Object.keys(obj).length === 0 && !obj.prototype;
  }
  function getDescriptorAddon() {
    return {
      isAbortingSuspended: false,
      isolateCallback(cb) {
        this.isAbortingSuspended = true;
        try {
          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }
          var result = cb(...args);
          this.isAbortingSuspended = false;
          return result;
        } catch (_unused) {
          var rid = randomId();
          this.isAbortingSuspended = false;
          throw new ReferenceError(rid);
        }
      },
    };
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
    abortCurrentInlineScript.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default abortCurrentInlineScript;

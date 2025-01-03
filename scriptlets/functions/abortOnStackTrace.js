function abortOnStackTrace(source, args) {
  function abortOnStackTrace(source, property, stack) {
    if (!property || !stack) {
      return;
    }
    var rid = randomId();
    var abort = function abort() {
      hit(source);
      throw new ReferenceError(rid);
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
      if (!stack.match(/^(inlineScript|injectedScript)$/) && !isValidStrPattern(stack)) {
        logMessage(source, 'Invalid parameter: '.concat(stack));
        return;
      }
      var descriptorWrapper = Object.assign(getDescriptorAddon(), {
        value: base[prop],
        get() {
          if (!this.isAbortingSuspended && this.isolateCallback(matchStackTrace, stack, new Error().stack)) {
            abort();
          }
          return this.value;
        },
        set(newValue) {
          if (!this.isAbortingSuspended && this.isolateCallback(matchStackTrace, stack, new Error().stack)) {
            abort();
          }
          this.value = newValue;
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
  function matchStackTrace(stackMatch, stackTrace) {
    if (!stackMatch || stackMatch === '') {
      return true;
    }
    if (shouldAbortInlineOrInjectedScript(stackMatch, stackTrace)) {
      return true;
    }
    var stackRegexp = toRegExp(stackMatch);
    var refinedStackTrace = stackTrace
      .split('\n')
      .slice(2)
      .map(function (line) {
        return line.trim();
      })
      .join('\n');
    return getNativeRegexpTest().call(stackRegexp, refinedStackTrace);
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
  function isEmptyObject(obj) {
    return Object.keys(obj).length === 0 && !obj.prototype;
  }
  function getNativeRegexpTest() {
    var descriptor = Object.getOwnPropertyDescriptor(RegExp.prototype, 'test');
    var nativeRegexTest = descriptor === null || descriptor === void 0 ? void 0 : descriptor.value;
    if (descriptor && typeof descriptor.value === 'function') {
      return nativeRegexTest;
    }
    throw new Error('RegExp.prototype.test is not a function');
  }
  function shouldAbortInlineOrInjectedScript(stackMatch, stackTrace) {
    var INLINE_SCRIPT_STRING = 'inlineScript';
    var INJECTED_SCRIPT_STRING = 'injectedScript';
    var INJECTED_SCRIPT_MARKER = '<anonymous>';
    var isInlineScript = function isInlineScript(match) {
      return match.includes(INLINE_SCRIPT_STRING);
    };
    var isInjectedScript = function isInjectedScript(match) {
      return match.includes(INJECTED_SCRIPT_STRING);
    };
    if (!(isInlineScript(stackMatch) || isInjectedScript(stackMatch))) {
      return false;
    }
    var documentURL = window.location.href;
    var pos = documentURL.indexOf('#');
    if (pos !== -1) {
      documentURL = documentURL.slice(0, pos);
    }
    var stackSteps = stackTrace
      .split('\n')
      .slice(2)
      .map(function (line) {
        return line.trim();
      });
    var stackLines = stackSteps.map(function (line) {
      var stack;
      var getStackTraceURL = /(.*?@)?(\S+)(:\d+):\d+\)?$/.exec(line);
      if (getStackTraceURL) {
        var _stackURL, _stackURL2;
        var stackURL = getStackTraceURL[2];
        if ((_stackURL = stackURL) !== null && _stackURL !== void 0 && _stackURL.startsWith('(')) {
          stackURL = stackURL.slice(1);
        }
        if ((_stackURL2 = stackURL) !== null && _stackURL2 !== void 0 && _stackURL2.startsWith(INJECTED_SCRIPT_MARKER)) {
          var _stackFunction;
          stackURL = INJECTED_SCRIPT_STRING;
          var stackFunction = getStackTraceURL[1] !== undefined ? getStackTraceURL[1].slice(0, -1) : line.slice(0, getStackTraceURL.index).trim();
          if ((_stackFunction = stackFunction) !== null && _stackFunction !== void 0 && _stackFunction.startsWith('at')) {
            stackFunction = stackFunction.slice(2).trim();
          }
          stack = ''.concat(stackFunction, ' ').concat(stackURL).trim();
        } else {
          stack = stackURL;
        }
      } else {
        stack = line;
      }
      return stack;
    });
    if (stackLines) {
      for (var index = 0; index < stackLines.length; index += 1) {
        if (isInlineScript(stackMatch) && documentURL === stackLines[index]) {
          return true;
        }
        if (isInjectedScript(stackMatch) && stackLines[index].startsWith(INJECTED_SCRIPT_STRING)) {
          return true;
        }
      }
    }
    return false;
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
    abortOnStackTrace.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default abortOnStackTrace;

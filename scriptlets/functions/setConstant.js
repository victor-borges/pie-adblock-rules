function setConstant(source, args) {
  function setConstant(source, property, value) {
    var stack = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
    var valueWrapper = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
    var setProxyTrap = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
    var uboAliases = ['set-constant.js', 'ubo-set-constant.js', 'set.js', 'ubo-set.js', 'ubo-set-constant', 'ubo-set'];
    if (uboAliases.includes(source.name)) {
      if (stack.length !== 1 && !getNumberFromString(stack)) {
        valueWrapper = stack;
      }
      stack = undefined;
    }
    if (!property || !matchStackTrace(stack, new Error().stack)) {
      return;
    }
    var isProxyTrapSet = false;
    var emptyArr = noopArray();
    var emptyObj = noopObject();
    var constantValue;
    if (value === 'undefined') {
      constantValue = undefined;
    } else if (value === 'false') {
      constantValue = false;
    } else if (value === 'true') {
      constantValue = true;
    } else if (value === 'null') {
      constantValue = null;
    } else if (value === 'emptyArr') {
      constantValue = emptyArr;
    } else if (value === 'emptyObj') {
      constantValue = emptyObj;
    } else if (value === 'noopFunc') {
      constantValue = noopFunc;
    } else if (value === 'noopCallbackFunc') {
      constantValue = noopCallbackFunc;
    } else if (value === 'trueFunc') {
      constantValue = trueFunc;
    } else if (value === 'falseFunc') {
      constantValue = falseFunc;
    } else if (value === 'throwFunc') {
      constantValue = throwFunc;
    } else if (value === 'noopPromiseResolve') {
      constantValue = noopPromiseResolve;
    } else if (value === 'noopPromiseReject') {
      constantValue = noopPromiseReject;
    } else if (/^\d+$/.test(value)) {
      constantValue = parseFloat(value);
      if (nativeIsNaN(constantValue)) {
        return;
      }
      if (Math.abs(constantValue) > 32767) {
        return;
      }
    } else if (value === '-1') {
      constantValue = -1;
    } else if (value === '') {
      constantValue = '';
    } else if (value === 'yes') {
      constantValue = 'yes';
    } else if (value === 'no') {
      constantValue = 'no';
    } else {
      return;
    }
    var valueWrapperNames = ['asFunction', 'asCallback', 'asResolved', 'asRejected'];
    if (valueWrapperNames.includes(valueWrapper)) {
      var valueWrappersMap = {
        asFunction(v) {
          return function () {
            return v;
          };
        },
        asCallback(v) {
          return function () {
            return function () {
              return v;
            };
          };
        },
        asResolved(v) {
          return Promise.resolve(v);
        },
        asRejected(v) {
          return Promise.reject(v);
        },
      };
      constantValue = valueWrappersMap[valueWrapper](constantValue);
    }
    var canceled = false;
    var mustCancel = function mustCancel(value) {
      if (canceled) {
        return canceled;
      }
      canceled = value !== undefined && constantValue !== undefined && typeof value !== typeof constantValue && value !== null;
      return canceled;
    };
    var trapProp = function trapProp(base, prop, configurable, handler) {
      if (!handler.init(base[prop])) {
        return false;
      }
      var origDescriptor = Object.getOwnPropertyDescriptor(base, prop);
      var prevSetter;
      if (origDescriptor instanceof Object) {
        if (!origDescriptor.configurable) {
          var message = "Property '".concat(prop, "' is not configurable");
          logMessage(source, message);
          return false;
        }
        if (base[prop]) {
          base[prop] = constantValue;
        }
        if (origDescriptor.set instanceof Function) {
          prevSetter = origDescriptor.set;
        }
      }
      Object.defineProperty(base, prop, {
        configurable: configurable,
        get() {
          return handler.get();
        },
        set(a) {
          if (prevSetter !== undefined) {
            prevSetter(a);
          }
          if (a instanceof Object) {
            var propertiesToCheck = property.split('.').slice(1);
            if (setProxyTrap && !isProxyTrapSet) {
              isProxyTrapSet = true;
              a = new Proxy(a, {
                get: function get(target, propertyKey, val) {
                  propertiesToCheck.reduce(function (object, currentProp, index, array) {
                    var currentObj = object === null || object === void 0 ? void 0 : object[currentProp];
                    if (index === array.length - 1 && currentObj !== constantValue) {
                      object[currentProp] = constantValue;
                    }
                    return currentObj || object;
                  }, target);
                  return Reflect.get(target, propertyKey, val);
                },
              });
            }
          }
          handler.set(a);
        },
      });
      return true;
    };
    var setChainPropAccess = function setChainPropAccess(owner, property) {
      var chainInfo = getPropertyInChain(owner, property);
      var base = chainInfo.base;
      var prop = chainInfo.prop,
        chain = chainInfo.chain;
      var inChainPropHandler = {
        factValue: undefined,
        init(a) {
          this.factValue = a;
          return true;
        },
        get() {
          return this.factValue;
        },
        set(a) {
          if (this.factValue === a) {
            return;
          }
          this.factValue = a;
          if (a instanceof Object) {
            setChainPropAccess(a, chain);
          }
        },
      };
      var endPropHandler = {
        init(a) {
          if (mustCancel(a)) {
            return false;
          }
          return true;
        },
        get() {
          return constantValue;
        },
        set(a) {
          if (!mustCancel(a)) {
            return;
          }
          constantValue = a;
        },
      };
      if (!chain) {
        var isTrapped = trapProp(base, prop, false, endPropHandler);
        if (isTrapped) {
          hit(source);
        }
        return;
      }
      if (base !== undefined && base[prop] === null) {
        trapProp(base, prop, true, inChainPropHandler);
        return;
      }
      if ((base instanceof Object || typeof base === 'object') && isEmptyObject(base)) {
        trapProp(base, prop, true, inChainPropHandler);
      }
      var propValue = owner[prop];
      if (propValue instanceof Object || (typeof propValue === 'object' && propValue !== null)) {
        setChainPropAccess(propValue, chain);
      }
      trapProp(base, prop, true, inChainPropHandler);
    };
    setChainPropAccess(window, property);
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
  function getNumberFromString(rawString) {
    var parsedDelay = parseInt(rawString, 10);
    var validDelay = nativeIsNaN(parsedDelay) ? null : parsedDelay;
    return validDelay;
  }
  function noopArray() {
    return [];
  }
  function noopObject() {
    return {};
  }
  function noopFunc() {}
  function noopCallbackFunc() {
    return noopFunc;
  }
  function trueFunc() {
    return true;
  }
  function falseFunc() {
    return false;
  }
  function throwFunc() {
    throw new Error();
  }
  function noopPromiseReject() {
    return Promise.reject();
  }
  function noopPromiseResolve() {
    var responseBody = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '{}';
    var responseUrl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var responseType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'basic';
    if (typeof Response === 'undefined') {
      return;
    }
    var response = new Response(responseBody, {
      status: 200,
      statusText: 'OK',
    });
    if (responseType === 'opaque') {
      Object.defineProperties(response, {
        body: {
          value: null,
        },
        status: {
          value: 0,
        },
        statusText: {
          value: '',
        },
        url: {
          value: '',
        },
        type: {
          value: responseType,
        },
      });
    } else {
      Object.defineProperties(response, {
        url: {
          value: responseUrl,
        },
        type: {
          value: responseType,
        },
      });
    }
    return Promise.resolve(response);
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
  function nativeIsNaN(num) {
    var native = Number.isNaN || window.isNaN;
    return native(num);
  }
  function isEmptyObject(obj) {
    return Object.keys(obj).length === 0 && !obj.prototype;
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
  function getNativeRegexpTest() {
    var descriptor = Object.getOwnPropertyDescriptor(RegExp.prototype, 'test');
    var nativeRegexTest = descriptor === null || descriptor === void 0 ? void 0 : descriptor.value;
    if (descriptor && typeof descriptor.value === 'function') {
      return nativeRegexTest;
    }
    throw new Error('RegExp.prototype.test is not a function');
  }
  function setPropertyAccess(object, property, descriptor) {
    var currentDescriptor = Object.getOwnPropertyDescriptor(object, property);
    if (currentDescriptor && !currentDescriptor.configurable) {
      return false;
    }
    Object.defineProperty(object, property, descriptor);
    return true;
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
    setConstant.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default setConstant;

function uboTrustedReplaceXhrResponse(source, args) {
  function uboTrustedReplaceXhrResponse(source) {
    var pattern = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var replacement = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    var propsToMatch = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
    if (typeof fetch === 'undefined' || typeof Proxy === 'undefined' || typeof Response === 'undefined') {
      return;
    }
    if (pattern === '' && replacement !== '') {
      // logMessage(source, "Pattern argument should not be empty string");
      return;
    }
    const safe = safeSelf();
    const logPrefix = safe.makeLogPrefix('trusted-replace-xhr-response', pattern, replacement, propsToMatch);
    const xhrInstances = new WeakMap();
    if (pattern === '*') {
      pattern = '.*';
    }
    const rePattern = safe.patternToRegex(pattern);
    const propNeedles = parsePropertiesToMatch(propsToMatch, 'url');
    const extraArgs = safe.getExtraArgs(Array.from(arguments), 3);
    const reIncludes = extraArgs.includes ? safe.patternToRegex(extraArgs.includes) : null;

    self.XMLHttpRequest = class extends self.XMLHttpRequest {
      open(method, url, ...args) {
        const outerXhr = this;
        const xhrDetails = { method, url };
        let outcome = 'match';
        if (propNeedles.size !== 0) {
          if (matchObjectProperties(propNeedles, xhrDetails) === false) {
            outcome = 'nomatch';
          }
        }
        if (outcome === 'match') {
          if (safe.logLevel > 1) {
            safe.uboLog(logPrefix, `Matched "propsToMatch"`);
          }
          xhrInstances.set(outerXhr, xhrDetails);
        }
        return super.open(method, url, ...args);
      }
      get response() {
        const innerResponse = super.response;
        const xhrDetails = xhrInstances.get(this);
        if (xhrDetails === undefined) {
          return innerResponse;
        }
        const responseLength = typeof innerResponse === 'string' ? innerResponse.length : undefined;
        if (xhrDetails.lastResponseLength !== responseLength) {
          xhrDetails.response = undefined;
          xhrDetails.lastResponseLength = responseLength;
        }
        if (xhrDetails.response !== undefined) {
          return xhrDetails.response;
        }
        if (typeof innerResponse !== 'string') {
          return (xhrDetails.response = innerResponse);
        }
        if (reIncludes && reIncludes.test(innerResponse) === false) {
          return (xhrDetails.response = innerResponse);
        }
        const textBefore = innerResponse;
        const textAfter = textBefore.replace(rePattern, replacement);
        if (textAfter !== textBefore) {
          safe.uboLog(logPrefix, 'Match');
        }
        return (xhrDetails.response = textAfter);
      }
      get responseText() {
        const response = this.response;
        if (typeof response !== 'string') {
          return super.responseText;
        }
        return response;
      }
    };
  }
  function safeSelf() {
    const self = globalThis;
    const safe = {
      Array_from: Array.from,
      Error: self.Error,
      Function_toStringFn: self.Function.prototype.toString,
      Function_toString: (thisArg) => safe.Function_toStringFn.call(thisArg),
      Math_floor: Math.floor,
      Math_max: Math.max,
      Math_min: Math.min,
      Math_random: Math.random,
      Object: Object,
      Object_defineProperty: Object.defineProperty.bind(Object),
      Object_defineProperties: Object.defineProperties.bind(Object),
      Object_fromEntries: Object.fromEntries.bind(Object),
      Object_getOwnPropertyDescriptor: Object.getOwnPropertyDescriptor.bind(Object),
      RegExp: self.RegExp,
      RegExp_test: self.RegExp.prototype.test,
      RegExp_exec: self.RegExp.prototype.exec,
      Request_clone: self.Request.prototype.clone,
      String_fromCharCode: String.fromCharCode,
      XMLHttpRequest: self.XMLHttpRequest,
      addEventListener: self.EventTarget.prototype.addEventListener,
      removeEventListener: self.EventTarget.prototype.removeEventListener,
      fetch: self.fetch,
      JSON: self.JSON,
      JSON_parseFn: self.JSON.parse,
      JSON_stringifyFn: self.JSON.stringify,
      JSON_parse: (...args) => safe.JSON_parseFn.call(safe.JSON, ...args),
      JSON_stringify: (...args) => safe.JSON_stringifyFn.call(safe.JSON, ...args),
      log: console.log.bind(console),
      // Properties
      logLevel: 0,
      // Methods
      makeLogPrefix(...args) {
        return (this.sendToLogger && `[${args.join(' \u205D ')}]`) || '';
      },
      uboLog(...args) {
        if (this.sendToLogger === undefined) {
          return;
        }
        if (args === undefined || args[0] === '') {
          return;
        }
        return this.sendToLogger('info', ...args);
      },
      uboErr(...args) {
        if (this.sendToLogger === undefined) {
          return;
        }
        if (args === undefined || args[0] === '') {
          return;
        }
        return this.sendToLogger('error', ...args);
      },
      escapeRegexChars(s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      },
      initPattern(pattern, options = {}) {
        if (pattern === '') {
          return { matchAll: true };
        }
        const expect = options.canNegate !== true || pattern.startsWith('!') === false;
        if (expect === false) {
          pattern = pattern.slice(1);
        }
        const match = /^\/(.+)\/([gimsu]*)$/.exec(pattern);
        if (match !== null) {
          return {
            re: new this.RegExp(match[1], match[2] || options.flags),
            expect,
          };
        }
        if (options.flags !== undefined) {
          return {
            re: new this.RegExp(this.escapeRegexChars(pattern), options.flags),
            expect,
          };
        }
        return { pattern, expect };
      },
      testPattern(details, haystack) {
        if (details.matchAll) {
          return true;
        }
        if (details.re) {
          return this.RegExp_test.call(details.re, haystack) === details.expect;
        }
        return haystack.includes(details.pattern) === details.expect;
      },
      patternToRegex(pattern, flags = undefined, verbatim = false) {
        if (pattern === '') {
          return /^/;
        }
        const match = /^\/(.+)\/([gimsu]*)$/.exec(pattern);
        if (match === null) {
          const reStr = this.escapeRegexChars(pattern);
          return new RegExp(verbatim ? `^${reStr}$` : reStr, flags);
        }
        try {
          return new RegExp(match[1], match[2] || undefined);
        } catch (ex) {}
        return /^/;
      },
      getExtraArgs(args, offset = 0) {
        const entries = args.slice(offset).reduce((out, v, i, a) => {
          if ((i & 1) === 0) {
            const rawValue = a[i + 1];
            const value = /^\d+$/.test(rawValue) ? parseInt(rawValue, 10) : rawValue;
            out.push([a[i], value]);
          }
          return out;
        }, []);
        return this.Object_fromEntries(entries);
      },
      onIdle(fn, options) {
        if (self.requestIdleCallback) {
          return self.requestIdleCallback(fn, options);
        }
        return self.requestAnimationFrame(fn);
      },
      offIdle(id) {
        if (self.requestIdleCallback) {
          return self.cancelIdleCallback(id);
        }
        return self.cancelAnimationFrame(id);
      },
    };
    return safe;
  }
  function parsePropertiesToMatch(propsToMatch, implicit = '') {
    const safe = safeSelf();
    const needles = new Map();
    if (propsToMatch === undefined || propsToMatch === '') {
      return needles;
    }
    const options = { canNegate: true };
    for (const needle of propsToMatch.split(/\s+/)) {
      const [prop, pattern] = needle.split(':');
      if (prop === '') {
        continue;
      }
      if (pattern !== undefined) {
        needles.set(prop, safe.initPattern(pattern, options));
      } else if (implicit !== '') {
        needles.set(implicit, safe.initPattern(prop, options));
      }
    }
    return needles;
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
    uboTrustedReplaceXhrResponse.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default uboTrustedReplaceXhrResponse;

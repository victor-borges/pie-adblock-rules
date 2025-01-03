function injectCssInShadowDom(source, args) {
  function injectCssInShadowDom(source, cssRule) {
    var hostSelector = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    if (!Element.prototype.attachShadow || typeof Proxy === 'undefined' || typeof Reflect === 'undefined') {
      return;
    }
    if (cssRule.match(/(url|image-set)\(.*\)/i)) {
      logMessage(source, '"url()" function is not allowed for css rules');
      return;
    }
    var callback = function callback(shadowRoot) {
      try {
        var stylesheet = new CSSStyleSheet();
        try {
          stylesheet.insertRule(cssRule);
        } catch (e) {
          logMessage(source, "Unable to apply the rule '".concat(cssRule, "' due to: \n'").concat(e.message, "'"));
          return;
        }
        shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, stylesheet];
      } catch (_unused) {
        var styleTag = document.createElement('style');
        styleTag.innerText = cssRule;
        shadowRoot.appendChild(styleTag);
      }
      hit(source);
    };
    hijackAttachShadow(window, hostSelector, callback);
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
  function hijackAttachShadow(context, hostSelector, callback) {
    var handlerWrapper = function handlerWrapper(target, thisArg, args) {
      var shadowRoot = Reflect.apply(target, thisArg, args);
      if (thisArg && thisArg.matches(hostSelector || '*')) {
        callback(shadowRoot);
      }
      return shadowRoot;
    };
    var attachShadowHandler = {
      apply: handlerWrapper,
    };
    context.Element.prototype.attachShadow = new Proxy(context.Element.prototype.attachShadow, attachShadowHandler);
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
    injectCssInShadowDom.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default injectCssInShadowDom;

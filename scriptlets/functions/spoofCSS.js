function spoofCSS(source, args) {
  function spoofCSS(source, selectors, cssPropertyName, cssPropertyValue) {
    if (!selectors) {
      return;
    }
    var uboAliases = ['spoof-css.js', 'ubo-spoof-css.js', 'ubo-spoof-css'];
    function convertToCamelCase(cssProperty) {
      if (!cssProperty.includes('-')) {
        return cssProperty;
      }
      var splittedProperty = cssProperty.split('-');
      var firstPart = splittedProperty[0];
      var secondPart = splittedProperty[1];
      return ''.concat(firstPart).concat(secondPart[0].toUpperCase()).concat(secondPart.slice(1));
    }
    var shouldDebug = !!(cssPropertyName === 'debug' && cssPropertyValue);
    var propToValueMap = new Map();
    if (uboAliases.includes(source.name)) {
      var args = source.args;
      var arrayOfProperties = [];
      var isDebug = args.at(-2);
      if (isDebug === 'debug') {
        arrayOfProperties = args.slice(1, -2);
      } else {
        arrayOfProperties = args.slice(1);
      }
      for (var i = 0; i < arrayOfProperties.length; i += 2) {
        if (arrayOfProperties[i] === '') {
          break;
        }
        propToValueMap.set(convertToCamelCase(arrayOfProperties[i]), arrayOfProperties[i + 1]);
      }
    } else if (cssPropertyName && cssPropertyValue && !shouldDebug) {
      propToValueMap.set(convertToCamelCase(cssPropertyName), cssPropertyValue);
    }
    var spoofStyle = function spoofStyle(cssProperty, realCssValue) {
      return propToValueMap.has(cssProperty) ? propToValueMap.get(cssProperty) : realCssValue;
    };
    var setRectValue = function setRectValue(rect, prop, value) {
      Object.defineProperty(rect, prop, {
        value: parseFloat(value),
      });
    };
    var getter = function getter(target, prop, receiver) {
      hit(source);
      if (prop === 'toString') {
        return target.toString.bind(target);
      }
      return Reflect.get(target, prop, receiver);
    };
    var getComputedStyleWrapper = function getComputedStyleWrapper(target, thisArg, args) {
      if (shouldDebug) {
        debugger;
      }
      var style = Reflect.apply(target, thisArg, args);
      if (!args[0].matches(selectors)) {
        return style;
      }
      var proxiedStyle = new Proxy(style, {
        get(target, prop) {
          var CSSStyleProp = target[prop];
          if (typeof CSSStyleProp !== 'function') {
            return spoofStyle(prop, CSSStyleProp || '');
          }
          if (prop !== 'getPropertyValue') {
            return CSSStyleProp.bind(target);
          }
          var getPropertyValueFunc = new Proxy(CSSStyleProp, {
            apply(target, thisArg, args) {
              var cssName = args[0];
              var cssValue = thisArg[cssName];
              return spoofStyle(cssName, cssValue);
            },
            get: getter,
          });
          return getPropertyValueFunc;
        },
        getOwnPropertyDescriptor(target, prop) {
          if (propToValueMap.has(prop)) {
            return {
              configurable: true,
              enumerable: true,
              value: propToValueMap.get(prop),
              writable: true,
            };
          }
          return Reflect.getOwnPropertyDescriptor(target, prop);
        },
      });
      hit(source);
      return proxiedStyle;
    };
    var getComputedStyleHandler = {
      apply: getComputedStyleWrapper,
      get: getter,
    };
    window.getComputedStyle = new Proxy(window.getComputedStyle, getComputedStyleHandler);
    var getBoundingClientRectWrapper = function getBoundingClientRectWrapper(target, thisArg, args) {
      if (shouldDebug) {
        debugger;
      }
      var rect = Reflect.apply(target, thisArg, args);
      if (!thisArg.matches(selectors)) {
        return rect;
      }
      var top = rect.top,
        bottom = rect.bottom,
        height = rect.height,
        width = rect.width,
        left = rect.left,
        right = rect.right;
      var newDOMRect = new window.DOMRect(rect.x, rect.y, top, bottom, width, height, left, right);
      if (propToValueMap.has('top')) {
        setRectValue(newDOMRect, 'top', propToValueMap.get('top'));
      }
      if (propToValueMap.has('bottom')) {
        setRectValue(newDOMRect, 'bottom', propToValueMap.get('bottom'));
      }
      if (propToValueMap.has('left')) {
        setRectValue(newDOMRect, 'left', propToValueMap.get('left'));
      }
      if (propToValueMap.has('right')) {
        setRectValue(newDOMRect, 'right', propToValueMap.get('right'));
      }
      if (propToValueMap.has('height')) {
        setRectValue(newDOMRect, 'height', propToValueMap.get('height'));
      }
      if (propToValueMap.has('width')) {
        setRectValue(newDOMRect, 'width', propToValueMap.get('width'));
      }
      hit(source);
      return newDOMRect;
    };
    var getBoundingClientRectHandler = {
      apply: getBoundingClientRectWrapper,
      get: getter,
    };
    window.Element.prototype.getBoundingClientRect = new Proxy(window.Element.prototype.getBoundingClientRect, getBoundingClientRectHandler);
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
    spoofCSS.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default spoofCSS;

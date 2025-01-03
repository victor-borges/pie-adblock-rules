function preventBab(source, args) {
  function preventBab(source) {
    var nativeSetTimeout = window.setTimeout;
    var babRegex = /\.bab_elementid.$/;
    var timeoutWrapper = function timeoutWrapper(callback) {
      if (typeof callback !== 'string' || !babRegex.test(callback)) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        return nativeSetTimeout.apply(window, [callback, ...args]);
      }
      hit(source);
    };
    window.setTimeout = timeoutWrapper;
    var signatures = [
      ['blockadblock'],
      ['babasbm'],
      [/getItem\('babn'\)/],
      [
        'getElementById',
        'String.fromCharCode',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        'charAt',
        'DOMContentLoaded',
        'AdBlock',
        'addEventListener',
        'doScroll',
        'fromCharCode',
        '<<2|r>>4',
        'sessionStorage',
        'clientWidth',
        'localStorage',
        'Math',
        'random',
      ],
    ];
    var check = function check(str) {
      if (typeof str !== 'string') {
        return false;
      }
      for (var i = 0; i < signatures.length; i += 1) {
        var tokens = signatures[i];
        var match = 0;
        for (var j = 0; j < tokens.length; j += 1) {
          var token = tokens[j];
          var found = token instanceof RegExp ? token.test(str) : str.includes(token);
          if (found) {
            match += 1;
          }
        }
        if (match / tokens.length >= 0.8) {
          return true;
        }
      }
      return false;
    };
    var nativeEval = window.eval;
    var evalWrapper = function evalWrapper(str) {
      if (!check(str)) {
        return nativeEval(str);
      }
      hit(source);
      var bodyEl = document.body;
      if (bodyEl) {
        bodyEl.style.removeProperty('visibility');
      }
      var el = document.getElementById('babasbmsgx');
      if (el) {
        el.parentNode.removeChild(el);
      }
    };
    window.eval = evalWrapper.bind(window);
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
    preventBab.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default preventBab;

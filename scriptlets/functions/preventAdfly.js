function preventAdfly(source, args) {
  function preventAdfly(source) {
    var isDigit = function isDigit(data) {
      return /^\d$/.test(data);
    };
    var handler = function handler(encodedURL) {
      var evenChars = '';
      var oddChars = '';
      for (var i = 0; i < encodedURL.length; i += 1) {
        if (i % 2 === 0) {
          evenChars += encodedURL.charAt(i);
        } else {
          oddChars = encodedURL.charAt(i) + oddChars;
        }
      }
      var data = (evenChars + oddChars).split('');
      for (var _i = 0; _i < data.length; _i += 1) {
        if (isDigit(data[_i])) {
          for (var ii = _i + 1; ii < data.length; ii += 1) {
            if (isDigit(data[ii])) {
              var temp = parseInt(data[_i], 10) ^ parseInt(data[ii], 10);
              if (temp < 10) {
                data[_i] = temp.toString();
              }
              _i = ii;
              break;
            }
          }
        }
      }
      data = data.join('');
      var decodedURL = window.atob(data).slice(16, -16);
      if (window.stop) {
        window.stop();
      }
      window.onbeforeunload = null;
      window.location.href = decodedURL;
    };
    var val;
    var applyHandler = true;
    var result = setPropertyAccess(window, 'ysmm', {
      configurable: false,
      set: function set(value) {
        if (applyHandler) {
          applyHandler = false;
          try {
            if (typeof value === 'string') {
              handler(value);
            }
          } catch (err) {}
        }
        val = value;
      },
      get: function get() {
        return val;
      },
    });
    if (result) {
      hit(source);
    } else {
      logMessage(source, 'Failed to set up prevent-adfly scriptlet');
    }
  }
  function setPropertyAccess(object, property, descriptor) {
    var currentDescriptor = Object.getOwnPropertyDescriptor(object, property);
    if (currentDescriptor && !currentDescriptor.configurable) {
      return false;
    }
    Object.defineProperty(object, property, descriptor);
    return true;
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
    preventAdfly.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default preventAdfly;

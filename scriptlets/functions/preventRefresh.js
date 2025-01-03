function preventRefresh(source, args) {
  function preventRefresh(source, delaySec) {
    var getMetaElements = function getMetaElements() {
      var metaNodes = [];
      try {
        metaNodes = document.querySelectorAll('meta[http-equiv="refresh" i][content]');
      } catch (e) {
        try {
          metaNodes = document.querySelectorAll('meta[http-equiv="refresh"][content]');
        } catch (e) {
          logMessage(source, e);
        }
      }
      return Array.from(metaNodes);
    };
    var getMetaContentDelay = function getMetaContentDelay(metaElements) {
      var delays = metaElements
        .map(function (meta) {
          var contentString = meta.getAttribute('content');
          if (contentString.length === 0) {
            return null;
          }
          var contentDelay;
          var limiterIndex = contentString.indexOf(';');
          if (limiterIndex !== -1) {
            var delaySubstring = contentString.substring(0, limiterIndex);
            contentDelay = getNumberFromString(delaySubstring);
          } else {
            contentDelay = getNumberFromString(contentString);
          }
          return contentDelay;
        })
        .filter(function (delay) {
          return delay !== null;
        });
      if (!delays.length) {
        return null;
      }
      var minDelay = delays.reduce(function (a, b) {
        return Math.min(a, b);
      });
      return minDelay;
    };
    var stop = function stop() {
      var metaElements = getMetaElements();
      if (metaElements.length === 0) {
        return;
      }
      var secondsToRun = getNumberFromString(delaySec);
      if (secondsToRun === null) {
        secondsToRun = getMetaContentDelay(metaElements);
      }
      if (secondsToRun === null) {
        return;
      }
      var delayMs = secondsToRun * 1e3;
      setTimeout(function () {
        window.stop();
        hit(source);
      }, delayMs);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', stop, {
        once: true,
      });
    } else {
      stop();
    }
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
  function getNumberFromString(rawString) {
    var parsedDelay = parseInt(rawString, 10);
    var validDelay = nativeIsNaN(parsedDelay) ? null : parsedDelay;
    return validDelay;
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
  function nativeIsNaN(num) {
    var native = Number.isNaN || window.isNaN;
    return native(num);
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
    preventRefresh.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default preventRefresh;

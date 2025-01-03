function noTopics(source, args) {
  function noTopics(source) {
    var TOPICS_PROPERTY_NAME = 'browsingTopics';
    if (Document instanceof Object === false) {
      return;
    }
    if (
      !Object.prototype.hasOwnProperty.call(Document.prototype, TOPICS_PROPERTY_NAME) ||
      Document.prototype[TOPICS_PROPERTY_NAME] instanceof Function === false
    ) {
      return;
    }
    Document.prototype[TOPICS_PROPERTY_NAME] = function () {
      return noopPromiseResolve('[]');
    };
    hit(source);
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
    noTopics.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default noTopics;

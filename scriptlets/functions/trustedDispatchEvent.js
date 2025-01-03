function trustedDispatchEvent(source, args) {
  function trustedDispatchEvent(source, event, target) {
    if (!event) {
      return;
    }
    var hasBeenDispatched = false;
    var eventTarget = document;
    if (target === 'window') {
      eventTarget = window;
    }
    var events = new Set();
    var dispatch = function dispatch() {
      var customEvent = new Event(event);
      if (typeof target === 'string' && target !== 'window') {
        eventTarget = document.querySelector(target);
      }
      var isEventAdded = events.has(event);
      if (!hasBeenDispatched && isEventAdded && eventTarget) {
        hasBeenDispatched = true;
        hit(source);
        eventTarget.dispatchEvent(customEvent);
      }
    };
    var wrapper = function wrapper(eventListener, thisArg, args) {
      var eventName = args[0];
      if (thisArg && eventName) {
        events.add(eventName);
        setTimeout(function () {
          dispatch();
        }, 1);
      }
      return Reflect.apply(eventListener, thisArg, args);
    };
    var handler = {
      apply: wrapper,
    };
    EventTarget.prototype.addEventListener = new Proxy(EventTarget.prototype.addEventListener, handler);
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
    trustedDispatchEvent.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default trustedDispatchEvent;

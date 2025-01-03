function nowebrtc(source, args) {
  function nowebrtc(source) {
    var propertyName = '';
    if (window.RTCPeerConnection) {
      propertyName = 'RTCPeerConnection';
    } else if (window.webkitRTCPeerConnection) {
      propertyName = 'webkitRTCPeerConnection';
    }
    if (propertyName === '') {
      return;
    }
    var rtcReplacement = function rtcReplacement(config) {
      var message = 'Document tried to create an RTCPeerConnection: '.concat(convertRtcConfigToString(config));
      logMessage(source, message);
      hit(source);
    };
    rtcReplacement.prototype = {
      close: noopFunc,
      createDataChannel: noopFunc,
      createOffer: noopFunc,
      setRemoteDescription: noopFunc,
    };
    var rtc = window[propertyName];
    window[propertyName] = rtcReplacement;
    if (rtc.prototype) {
      rtc.prototype.createDataChannel = function (a, b) {
        return {
          close: noopFunc,
          send: noopFunc,
        };
      }.bind(null);
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
  function noopFunc() {}
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
  function convertRtcConfigToString(config) {
    var UNDEF_STR = 'undefined';
    var str = UNDEF_STR;
    if (config === null) {
      str = 'null';
    } else if (config instanceof Object) {
      var SERVERS_PROP_NAME = 'iceServers';
      var URLS_PROP_NAME = 'urls';
      if (
        Object.prototype.hasOwnProperty.call(config, SERVERS_PROP_NAME) &&
        config[SERVERS_PROP_NAME] &&
        Object.prototype.hasOwnProperty.call(config[SERVERS_PROP_NAME][0], URLS_PROP_NAME) &&
        !!config[SERVERS_PROP_NAME][0][URLS_PROP_NAME]
      ) {
        str = config[SERVERS_PROP_NAME][0][URLS_PROP_NAME].toString();
      }
    }
    return str;
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
    nowebrtc.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default nowebrtc;

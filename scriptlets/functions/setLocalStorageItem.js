function setLocalStorageItem(source, args) {
  function setLocalStorageItem(source, key, value) {
    if (typeof key === 'undefined') {
      logMessage(source, 'Item key should be specified.');
      return;
    }
    var validValue;
    try {
      validValue = getLimitedStorageItemValue(value);
    } catch (_unused) {
      logMessage(source, "Invalid storage item value: '".concat(value, "'"));
      return;
    }
    var _window = window,
      localStorage = _window.localStorage;
    if (validValue === '$remove$') {
      removeStorageItem(source, localStorage, key);
    } else {
      setStorageItem(source, localStorage, key, validValue);
    }
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
  function setStorageItem(source, storage, key, value) {
    try {
      storage.setItem(key, value);
    } catch (e) {
      var message = 'Unable to set sessionStorage item due to: '.concat(e.message);
      logMessage(source, message);
    }
  }
  function removeStorageItem(source, storage, key) {
    try {
      if (key.startsWith('/') && (key.endsWith('/') || key.endsWith('/i')) && isValidStrPattern(key)) {
        var regExpKey = toRegExp(key);
        var storageKeys = Object.keys(storage);
        storageKeys.forEach(function (storageKey) {
          if (regExpKey.test(storageKey)) {
            storage.removeItem(storageKey);
          }
        });
      } else {
        storage.removeItem(key);
      }
    } catch (e) {
      var message = 'Unable to remove storage item due to: '.concat(e.message);
      logMessage(source, message);
    }
  }
  function getLimitedStorageItemValue(value) {
    if (typeof value !== 'string') {
      throw new Error('Invalid value');
    }
    var allowedStorageValues = new Set(['undefined', 'false', 'true', 'null', '', 'yes', 'no', 'on', 'off']);
    var validValue;
    if (allowedStorageValues.has(value.toLowerCase())) {
      validValue = value;
    } else if (value === 'emptyArr') {
      validValue = '[]';
    } else if (value === 'emptyObj') {
      validValue = '{}';
    } else if (/^\d+$/.test(value)) {
      validValue = parseFloat(value);
      if (nativeIsNaN(validValue)) {
        throw new Error('Invalid value');
      }
      if (Math.abs(validValue) > 32767) {
        throw new Error('Invalid value');
      }
    } else if (value === '$remove$') {
      validValue = '$remove$';
    } else {
      throw new Error('Invalid value');
    }
    return validValue;
  }
  function isValidStrPattern(input) {
    var FORWARD_SLASH = '/';
    var str = escapeRegExp(input);
    if (input[0] === FORWARD_SLASH && input[input.length - 1] === FORWARD_SLASH) {
      str = input.slice(1, -1);
    }
    var isValid;
    try {
      isValid = new RegExp(str);
      isValid = true;
    } catch (e) {
      isValid = false;
    }
    return isValid;
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
  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
    setLocalStorageItem.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default setLocalStorageItem;

function trustedReplaceNodeText(source, args) {
  function trustedReplaceNodeText(source, nodeName, textMatch, pattern, replacement) {
    var uboAliases = ['ubo-trusted-rpnt', 'replace-node-text.js', 'rpnt.js', 'sed.js'];
    if (uboAliases.includes(source.name)) {
      replacement = pattern;
      pattern = textMatch;
      for (var _len = arguments.length, extraArgs = new Array(_len > 5 ? _len - 5 : 0), _key = 5; _key < _len; _key++) {
        extraArgs[_key - 5] = arguments[_key];
      }
      for (var i = 0; i < extraArgs.length; i += 1) {
        var arg = extraArgs[i];
        if (arg === 'condition') {
          textMatch = extraArgs[i + 1];
          break;
        }
      }
    }
    var _parseNodeTextParams = parseNodeTextParams(nodeName, textMatch, pattern),
      selector = _parseNodeTextParams.selector,
      nodeNameMatch = _parseNodeTextParams.nodeNameMatch,
      textContentMatch = _parseNodeTextParams.textContentMatch,
      patternMatch = _parseNodeTextParams.patternMatch;
    var handleNodes = function handleNodes(nodes) {
      return nodes.forEach(function (node) {
        var shouldReplace = isTargetNode(node, nodeNameMatch, textContentMatch);
        if (shouldReplace) {
          replaceNodeText(source, node, patternMatch, replacement);
        }
      });
    };
    if (document.documentElement) {
      handleExistingNodes(selector, handleNodes);
    }
    observeDocumentWithTimeout(function (mutations) {
      return handleMutations(mutations, handleNodes);
    });
  }
  function observeDocumentWithTimeout(callback) {
    var options =
      arguments.length > 1 && arguments[1] !== undefined
        ? arguments[1]
        : {
            subtree: true,
            childList: true,
          };
    var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1e4;
    var documentObserver = new MutationObserver(function (mutations, observer) {
      observer.disconnect();
      callback(mutations, observer);
      observer.observe(document.documentElement, options);
    });
    documentObserver.observe(document.documentElement, options);
    if (typeof timeout === 'number') {
      setTimeout(function () {
        return documentObserver.disconnect();
      }, timeout);
    }
  }
  function handleExistingNodes(selector, handler) {
    var nodeList = document.querySelectorAll(selector);
    var nodes = nodeListToArray(nodeList);
    handler(nodes);
  }
  function handleMutations(mutations, handler) {
    var addedNodes = getAddedNodes(mutations);
    handler(addedNodes);
  }
  function replaceNodeText(source, node, pattern, replacement) {
    var textContent = node.textContent;
    if (textContent) {
      if (!window.trustedPolicy) {
        window.trustedPolicy = window.trustedTypes.createPolicy('default', {
          createHTML: (input) => input,
          createScript: (input) => input,
          createScriptURL: (input) => input,
        });
      }
      node.textContent = window.trustedPolicy.createScript(textContent.replace(pattern, replacement));
      hit(source);
    }
  }
  function isTargetNode(node, nodeNameMatch, textContentMatch) {
    var nodeName = node.nodeName,
      textContent = node.textContent;
    var nodeNameLowerCase = nodeName.toLowerCase();
    return (
      textContent !== null &&
      textContent !== '' &&
      (nodeNameMatch instanceof RegExp ? nodeNameMatch.test(nodeNameLowerCase) : nodeNameMatch === nodeNameLowerCase) &&
      (textContentMatch instanceof RegExp ? textContentMatch.test(textContent) : textContent.includes(textContentMatch))
    );
  }
  function parseNodeTextParams(nodeName, textMatch) {
    var pattern = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var REGEXP_START_MARKER = '/';
    var isStringNameMatch = !(nodeName.startsWith(REGEXP_START_MARKER) && nodeName.endsWith(REGEXP_START_MARKER));
    var selector = isStringNameMatch ? nodeName : '*';
    var nodeNameMatch = isStringNameMatch ? nodeName : toRegExp(nodeName);
    var textContentMatch = !textMatch.startsWith(REGEXP_START_MARKER) ? textMatch : toRegExp(textMatch);
    var patternMatch;
    if (pattern) {
      patternMatch = !pattern.startsWith(REGEXP_START_MARKER) ? pattern : toRegExp(pattern);
    }
    return {
      selector: selector,
      nodeNameMatch: nodeNameMatch,
      textContentMatch: textContentMatch,
      patternMatch: patternMatch,
    };
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
  function nodeListToArray(nodeList) {
    var nodes = [];
    for (var i = 0; i < nodeList.length; i += 1) {
      nodes.push(nodeList[i]);
    }
    return nodes;
  }
  function getAddedNodes(mutations) {
    var nodes = [];
    for (var i = 0; i < mutations.length; i += 1) {
      var addedNodes = mutations[i].addedNodes;
      for (var j = 0; j < addedNodes.length; j += 1) {
        nodes.push(addedNodes[j]);
      }
    }
    return nodes;
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
    trustedReplaceNodeText.apply(this, updatedArgs);
  } catch (e) {
    //
  }
}

export default trustedReplaceNodeText;

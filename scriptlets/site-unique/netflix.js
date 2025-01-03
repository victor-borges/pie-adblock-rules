function netflix(source, args) {
  function netflix(source) {
    var ReplaceMap = {
      adBreaks: [],
      adState: null,
      currentAdBreak: 'undefined',
    };
    Object.defineProperty = new Proxy(Object.defineProperty, {
      apply: (target, thisArg, ArgsList) => {
        var Original = Reflect.apply(target, thisArg, ArgsList);
        if (ArgsList[1] == 'getAdBreaks' || ArgsList[1] == 'getAdsDisplayStringParams') {
          return (Original[ArgsList[1]] = function () {});
        } else if (ArgsList[1] == 'adBreaks' || ArgsList[1] == 'currentAdBreak' || typeof Original['adBreaks'] !== 'undefined') {
          for (var [key, value] of Object.entries(Original)) {
            if (typeof ReplaceMap[key] !== 'undefined' && ReplaceMap[key] !== 'undefined') {
              Original[key] = ReplaceMap[key];
            } else if (typeof ReplaceMap[key] !== 'undefined' && ReplaceMap[key] === 'undefined') {
              Original[key] = undefined;
            }
          }
          return Original;
        } else {
          return Original;
        }
      },
    });
  }
  const updatedArgs = args ? [].concat(source).concat(args) : [source];
  if (!window._pisources) {
    window._pisources = {};
  }
  if (window._pisources[source.name]) {
    if (window._pisources[source.name].includes(JSON.stringify(args))) {
      return;
    }
  } else {
    window._pisources[source.name] = [];
  }
  window._pisources[source.name].push(JSON.stringify(args));
  try {
    netflix.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default netflix;


/**
 * Injects a scriptlet into a specified tab or frame using the Chrome scripting API.
 *
 * This function takes the output from the `parseScriptletRule` function and uses the Chrome
 * scripting API to inject the scriptlet into the specified tab or frame. The scriptlet is
 * typically used for ad-blocking purposes or other content manipulation tasks.
 *
 * @param {Object} scriptletRule - The parsed scriptlet rule object.
 * @param {number} tabId - The ID of the tab where the scriptlet should be injected.
 * @param {number} [frameId=0] - The ID of the frame within the tab where the scriptlet should be injected. Defaults to 0 (main frame).
 * @param {function} [callback] - Optional callback function to be executed after the scriptlet is injected.
 *
 * @returns {void}
 *
 * @example
 * const scriptletRule = parseScriptletRule(ruleString);
 * await injectScriptletAsFunc(scriptletRule, 1, 0);
 */
async function injectScriptletAsFunc(scriptSource, tabId, frameId = 0) {
  if (!scriptSource.func) {
    return;
  }
  let funcToInject = scriptSource.func;

  await chrome.scripting.executeScript({
    target: { tabId, frameIds: [frameId] },
    func: funcToInject,
    injectImmediately: true,
    world: 'MAIN',
    // Safari throws an error that it's unable to serialize scriptSource (likely due to including a function)
    // Ensure it's in a JSON serializable format by stringifying and parsing it.
    args: [JSON.parse(JSON.stringify(scriptSource)), scriptSource.args],
  });
}


async function injectScriptletAsFile(scriptSource, tabId, frameId = 0) {
  if (!scriptSource.file) {
    return;
  }
  let fileToInject = scriptSource.file;
  await chrome.scripting.executeScript({
    target: { tabId, frameIds: [frameId] },
    files: [fileToInject],
    injectImmediately: true,
    world: 'MAIN',
    args: [scriptSource.args],
  });
}

export { injectScriptletAsFunc, injectScriptletAsFile };

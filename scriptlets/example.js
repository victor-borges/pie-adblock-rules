import { getScriptletFunction } from "./built/scriptlets-built-main.js";
import parseScriptletText from "./parseScriptletText.js";
import { injectScriptletAsFunc, injectScriptletAsFile } from "./runScriptlet.js";

/**
 * Example usage in extension:
 */
async function parseAndRunScriptletRule(ruleText) {
  const scriptletRule = parseScriptletText(ruleText);
  if (!scriptletRule) {
    return;
  }
  console.log('parsed scriptlet text:', scriptletRule);
  const scriptletFunction = getScriptletFunction(scriptletRule.name);
  if (!scriptletFunction) {
    return;
  }

  console.log('found matching scriptlet name, about to inject:', scriptletFunction);
  // assuming tabId is 1 and frameId is 0
  await injectScriptletAsFunc(scriptletFunction, scriptletRule, 1, 0);
}

// adguard formatted rule:
console.log('testing adguard formatted rule');
parseAndRunScriptletRule(`example.com#%#//scriptlet('remove-class', 'arg1', 'arg2')`);
// ubo/abp formatted rule:
console.log('testing ubo/abp formatted rule');
parseAndRunScriptletRule(`example.com##+js(remove-class, 'modal-open', 'body')`);

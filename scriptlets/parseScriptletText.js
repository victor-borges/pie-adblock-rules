const ADG_SCRIPTLET_MARKER = '#%#//';
const UBO_SCRIPTLET_MARKER = /##\+js/;
const ESCAPED_COMMA_PLACEHOLDER = `-_${Date.now().toString()}_-`;
const ESCAPED_COMMA_REPLACE_REGEX = new RegExp(ESCAPED_COMMA_PLACEHOLDER, 'g');

// parse the scriplet name and arguments from the string: domain.com#%#//scriptlet('name', 'arg1', 'arg2', ...)
function parseAdgScriptlet(ruleText) {
  const scriptletNameMatch = ruleText.match(/scriptlet\('([^']+)'/);
  if (!scriptletNameMatch) {
    // if there is no matching scriptlet name, could be raw javascript, which we don't allow
    return null;
  }
  const scriptletName = scriptletNameMatch[1];
  const ruleParts = ruleText.split('#%#//scriptlet');
  // parse the domains from the left side of the rule
  let domains = ruleParts[0];
  if (domains.includes(',')) {
    // multiple domains are separated by commas
    domains = domains.split(',');
  } else {
    domains = [domains]; // only one domain, make it a single entry arrray
  }
  // parse arguments from the right side of the rule
  const rightSideRule = ruleParts[1].match(/^\((.*)\)$/)[1];
  let scriptletArgs = rightSideRule.split(/, +/);
  scriptletArgs.forEach((arg, i) => {
    scriptletArgs[i] = arg.replace(/'/g, '');
  });
  scriptletArgs = scriptletArgs.slice(1);
  return {
    domains,
    args: scriptletArgs,
    name: scriptletName,
  };
}

function parseUboScriptlet(ruleText) {
  const ruleTextWithPlaceholder = ruleText.replace(/\\,/g, ESCAPED_COMMA_PLACEHOLDER);
  const scriptletNameMatch = ruleTextWithPlaceholder.match(/##\+js\((.*?),/); // extract scriptlet name
  if (!scriptletNameMatch) {
    return null;
  }
  const scriptletName = `ubo-${scriptletNameMatch[1]}`;
  const ruleParts = ruleTextWithPlaceholder.split(UBO_SCRIPTLET_MARKER);
  // parse the domains from the left side of the rule
  let domains = ruleParts[0];
  if (domains.includes(',')) {
    // multiple domains are separated by commas
    domains = domains.split(',');
  } else {
    domains = [domains]; // only one domain, make it a single entry arrray
  }
  // parse arguments from the right side of the rule
  let rightSideRule = ruleParts[1].match(/^\((.*)\)$/)[1];
  const rightSideSave = [];
  // before splitting by , make sure any commas inside the quotes are not split by saving the whole arg
  if (rightSideRule.indexOf("',") !== -1) {
    const rightSideMatch = rightSideRule.match(/, ('.*?')/g);
    if (rightSideMatch.length > 0) {
      // replace all matches with their corresponding saved arg
      for (let i = 0; i < rightSideMatch.length; i += 1) {
        const rightSideTextToSave = rightSideMatch[i].match(/'(.*?)'/)[1];
        rightSideSave.push(rightSideTextToSave);
        rightSideRule = rightSideRule.replace(rightSideMatch[i], `, SAVED_ARG_${i}`);
      }
    }
  }
  let scriptletArgs = rightSideRule.split(/, +/);
  if (rightSideSave.length) {
    let i = 0;
    scriptletArgs = scriptletArgs.map((arg) => {
      if (arg.match(/SAVED_ARG_(\d+)/)) {
        const argToReturn = rightSideSave[i];
        i += 1;
        return argToReturn;
      }
      return arg;
    });
  }
  scriptletArgs.forEach((arg, i) => {
    if (i === 0) {
      return;
    }
    scriptletArgs[i] = arg.replace(ESCAPED_COMMA_REPLACE_REGEX, ','); // no extra parsing needed? tbd
  });
  scriptletArgs = scriptletArgs.slice(1); // remove the first arg
  return {
    domains,
    ruleType: 'ubo',
    args: scriptletArgs,
    name: scriptletName,
  };
}


/**
 * Parses the given scriptlet rule text and returns the corresponding scriptlet object.
 *
 * This function attempts to parse the provided rule text to determine if it matches
 * known scriptlet markers (e.g., ADG or UBO). If a match is found, the corresponding
 * parsing function is called to handle the specific scriptlet type. If no match is found
 * or an error occurs during parsing, the function returns null.
 *
 * @param {string} ruleText - The scriptlet rule text to be parsed.
 * @returns {Object|null} - The parsed scriptlet object if successful, or null if parsing fails or no match is found.
 * Object properties:
 *  - {string[]} domains - The domains to which the scriptlet applies.
 * - {string} name - The name of the scriptlet function. to be matched with the exported function names from built-scriptlets-main.js
 * - {string[]} args - The arguments to be passed to the scriptlet function.
 * - {string} [ruleType] - The type of scriptlet rule (e.g., 'adg', 'ubo', etc.).
 */
function parseScriptletText(ruleText) {
  try {
    if (ruleText.match(ADG_SCRIPTLET_MARKER)) {
      return parseAdgScriptlet(ruleText);
    }
    if (ruleText.match(UBO_SCRIPTLET_MARKER)) {
      return parseUboScriptlet(ruleText);
    }
    // TODO: build cases for redirect and other scripts
    return null;
  } catch (e) {
    return null;
  }
}

export default parseScriptletText;

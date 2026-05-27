const { CATEGORY_DEFINITIONS } = require("./categories");

module.exports = Object.entries(CATEGORY_DEFINITIONS).reduce((accumulator, [canonical, definition]) => {
  accumulator[canonical] = {
    section: definition.section,
    key: definition.configKey,
  };
  return accumulator;
}, {});

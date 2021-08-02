const log4js = require("log4js")

log4js.configure({
    appenders: { xray2slack: { type: "file", filename: "xray2slack.log" } },
    categories: { default: { appenders: ["xray2slack"], level: "info", level: "error", level: "debug" } }
  });
  
const logger = log4js.getLogger("xray2slack");

module.exports = logger
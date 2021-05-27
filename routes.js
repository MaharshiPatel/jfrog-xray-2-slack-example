//
// An example integrate Slack with JFrog Xray
// Author: @greenido
// Date: April 2019
//
//
// This defines three routes that our API is going to use.
//
const fs = require("fs");
const https = require("https");
const dotenv = require("dotenv");

// Loads environment variables from the .env file into process.env
dotenv.config();

//
// Main End points of our app
//
var routes = function(app) {

  //
  // The API end-point that get the notifications from Xray and send them as messages to Slack
  //
  app.post("/xray/api", function(req, res) {
    let payload = req.body;
    console.log(payload);

    let totalIssues = payload.issues.length;

    // send each component to Slack
    let tmpStr = `🔔 Policy: ${payload.policy_name} 
        Watch: ${payload.watch_name} 
        Created: ${JSON.stringify(payload.created).split('.')[0]} 
        Number Of Issues: ${payload.issues.length}`;

    // let's see what are we going to send to Slack
    console.log(`${tmpStr} --> sending to Slack`);

    console.log(`ℹ️ first - ${JSON.stringify(payload.issues[0])}`)

    // Build a nice msg
    const xrayNotification = {
      username: "Xray notifier",
      text: tmpStr, // text
      icon_emoji: ":bangbang:",
      attachments: [
        {
          color: "#eed140",
          // You can add more fields as the data from Xray contains more information
          fields: [
            {
              title: "Type",
              value: payload.issues[0].type,
              short: true
            },
            {
              title: "Severity",
              value: payload.issues[0].severity,
              short: true
            },
            {
              title: "Created",
              value: payload.issues[0].created,
              short: true
            },
            {
              title: "Provider",
              value: payload.issues[0].provider,
              short: true
            },
            {
              title: "Summary",
              value: payload.issues[0].summary
            }
          ]
        }
      ]
    };

    sendSlackMessage(xrayNotification);

    // just in case you wish to monitor this API end point
    return res.json({ status: "All Good", msg_sent: totalIssues });
  });
};

/**
 * Send formated messages to Slack
 *
 * @param messageBody
 * @return {Promise}
 */
function sendSlackMessage(messageBody) {
  try {
    //console.log("=== " + messageBody);
    messageBody = JSON.stringify(messageBody);
  } catch (e) {
    console.log("Got ERR with sending msg to slack ");
    console.log(e);
  }

  // Promisify the https.request
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: "POST",
      header: {
        "Content-Type": "application/json"
      }
    };

    // actual request
    const req = https.request(
      process.env.SLACK_WEBHOOK_URL,
      requestOptions,
      res => {
        let response = "";

        res.on("data", d => {
          response += d;
        });

        res.on("end", () => {
          resolve(response);
        });
      }
    );

    req.on("error", e => {
      reject(e);
    });

    // send our message body (was parsed to JSON beforehand)
    req.write(messageBody);
    req.end();
  });
}

module.exports = routes;

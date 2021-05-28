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
    // console.log(payload);
    let watchLink = `${req.protocol}://${req.get('host')}/ui/watchesNew/edit/${payload.watch_name}`
    let issues = payload.issues;
    let totalIssues = issues.length;
    let assetType, asset, assetName, versionNumber, titleLink;
    if(totalIssues > 0) {
      assetType = issues[0].impacted_artifacts[0].pkg_type;
      asset = issues[0].impacted_artifacts[0].display_name;
      assetName = asset.split(":")[0];
      versionNumber = asset.split(":")[1];
      titleLink = (assetType == "Build") ? 
        `${process.env.JPD_INSTANCE_URL}/ui/builds/${assetName}/${versionNumber}` : 
        `${process.env.JPD_INSTANCE_URL}/ui/packages?name=${assetName}&type=packages&version=${versionNumber}`
    }

    console.log(`assetType : ${assetType} , titleLink : ${titleLink}`)
    
    // send each component to Slack
    let tmpStr = `🔔 Number Of Alert : ${payload.issues.length}
        Created : ${payload.created}`;

    // Build a nice msg
    const xrayNotification = {
      username: "Xray notifier",
      text: tmpStr, // text
      icon_emoji: ":bangbang:",
      attachments: [
        {
          color: "#eed140",
          "title": `${assetType}: ${asset}`,
          "title_link": `${titleLink}`,
          fields: [
            {
              title: "Watch",
              value: `${payload.watch_name}`,
              short: true
            },
            {
              title: "Policy",
              value: `${payload.policy_name}`,
              short: true
            },
            {
              title: "Top Severity",
              value: `${payload.top_severity}`,
              short: true
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

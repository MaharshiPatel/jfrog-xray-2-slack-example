const https = require("https");
const CircularJSON = require("circular-json")
const logger = require("./common/logger")
let routes = function(app) {

  app.get('/healthcheck', function (req, res) {
    logger.info(`ok!`)
    res.send('ok!')
  })

  app.post("/xray/api", function(req, res) {
    let payload = req.body
    logger.info(JSON.stringify(payload))
    let watchLink = `${req.protocol}://${req.get('host')}/ui/watchesNew/edit/${payload.watch_name}`
    let issues = payload.issues
    let totalIssues = issues.length
    let assetType, asset, assetName, versionNumber, titleLink

    if(totalIssues > 0) {
      assetType = issues[0].impacted_artifacts[0].pkg_type
      asset = issues[0].impacted_artifacts[0].display_name
      assetName = asset.split(":")[0]
      versionNumber = asset.split(":")[1]
      titleLink = (assetType == "Build") ? 
        `${process.env.JPD_INSTANCE_URL}/ui/builds/${assetName}/${versionNumber}` : 
        `${process.env.JPD_INSTANCE_URL}/ui/packages?name=${assetName}&type=packages&version=${versionNumber}`
    }

    logger.info(`assetType : ${assetType} , titleLink : ${titleLink}`)
    
    // send each component to Slack
    let tmpStr = `Number Of Alert - ${payload.issues.length}`

    // Build a nice msg
    const xrayNotification = {
      username: "JFrog Xray",
      text: tmpStr, // text
      icon_emoji: ":bell:",
      attachments: [
        {
          color: "#eed140",
          "title": `${assetType} - ${asset}`,
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
            },
            {
              title: "Created",
              value: `${payload.created}`,
              short: true
            }
          ]
        }
      ]
    }

    sendSlackMessage(xrayNotification)

    // just in case you wish to monitor this API end point
    return res.json({ status: "All Good", msg_sent: totalIssues })
  })
}

/**
 * Send formated messages to Slack
 *
 * @param messageBody
 * @return {Promise}
 */
function sendSlackMessage(messageBody) {
  try {
    messageBody = JSON.stringify(messageBody)
  } catch (e) {
    logger.error("Got an error with sending message to slack ")
    logger.error(e)
  }

  // Promisify the https.request
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: "POST",
      header: {
        "Content-Type": "application/json"
      }
    }

    // actual request
    const req = https.request(
      process.env.SLACK_WEBHOOK_URL,
      requestOptions,
      res => {
        let response = ""

        res.on("data", d => {
          response += d
        })

        res.on("end", () => {
          resolve(response)
        })
      }
    )

    req.on("error", e => {
      logger.error(e)
      reject(e)
    })

    // send our message body (was parsed to JSON beforehand)
    req.write(messageBody)
    req.end()
  })
}

module.exports = routes

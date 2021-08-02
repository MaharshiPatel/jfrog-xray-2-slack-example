const express = require("express")
const dotenv = require("dotenv")
const logger = require("./common/logger")

const PORT = 3300
// Loads environment variables from the .env file into process.env
dotenv.config()

let app = express()
app.use(express.json({
  limit: '100mb',
  extended: true
}))
app.use(express.urlencoded({
  limit: '100mb',
  extended: true
}))

let routes = require("./routes.js")(app)

app.listen(PORT, () => {
  logger.info(`Listening on port - ${PORT}`)
})

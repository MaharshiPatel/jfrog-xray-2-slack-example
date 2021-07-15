const request = require("request");
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan')

let app = express();
app.use(morgan('combined'))
app.use(express.json({
  limit: '100mb',
  extended: true
}));
app.use(express.urlencoded({
  limit: '100mb',
  extended: true
}));

// put all the routes in place
let routes = require("./routes.js")(app);

//
// Start the (API)
//
let server = app.listen(3000, function() {
  console.log(`Listening on port - ${server.address().port} `);
});

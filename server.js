//
// An example integrate Slack with JFrog Xray
// Author: @greenido
// Date: April 2019
//
// This is where the app starts, and sets things up
// We require the packages we need, body parser and express, and then set up body parser to accept
// JSON and URL encoded values. We then include the `routes.js` file, in which we define the API
// end-points we're going to be using, and we pass it the `app` variable. Lastly, we specify the
// port to listen to for requests. In this case, port 3000.
//
const request = require("request");
const express = require("express");
const bodyParser = require("body-parser");

let app = express();

// put all the routes in place
let routes = require("./routes.js")(app);

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

//
// Start the (API)
//
let server = app.listen(3300, function() {
  console.log(`Listening on port ${server.address().port}`);
});

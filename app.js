const express = require("express");
const app = express();
const port = 3000;

// mongoDB details
require("dotenv").config();
const bodyParser = require("body-parser");
const { uriToCID } = require("./src/helpers/uriToCID");

app.use(express.json());

// Define a route for the callback URL
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  (request, response) => {
    let event;

    try {
      if (request.body.data.status == "finished") {
        console.log("STATUS", request.body);
        // Filter CID from url
        console.log(request.body.media.uri);
        const cid = uriToCID(request.body.media.uri);
        console.log("CID", cid);

        // Add request.body to Contract
      }
    } catch (error) {}

    // Acknowledge receipt
    response.json({ received: true });
  }
);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

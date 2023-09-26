const express = require("express");
const app = express();
const port = 3000;

// mongoDB details
require("dotenv").config();
const bodyParser = require("body-parser");

app.use(express.json());

// Define a route for the callback URL
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  (request, response) => {
    let event;

    content = JSON.parse(request.body);
    // Handle the incoming callback data here
    console.log("Received callback:", request.body);
    try {
      console.log("STATUS", request.body.data.status);
    } catch (error) {}

    // Acknowledge receipt
    response.json({ received: true });
  }
);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

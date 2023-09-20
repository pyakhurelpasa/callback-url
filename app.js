const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

// Define a route for the callback URL
app.post("/webhook", (req, res) => {
  // Handle the incoming callback data here
  console.log("Received callback:", req.body);
  res.sendStatus(200); // Send a response to acknowledge receipt
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

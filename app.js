const express = require("express");
const app = express();
const port = 3000;
const ethers = require("ethers");
require("dotenv").config();
const bodyParser = require("body-parser");
const helmet = require("helmet"); // Import helmet middleware
const contractABI = require("./CIDVerifier.json");
const contractAddress = process.env.CID_VERFIER_CONTRACT_ADDRESS;
const privateKey = process.env.WALLET_PRIVATE_KEY;
const providerUrl = "wss://ws-filecoin-calibration.chainstacklabs.com/rpc/v1";
const providerNetworkId = 314159;

// Validate that required environment variables are set
if (!contractAddress || !privateKey) {
  console.error(
    "Missing contract address or private key in environment variables."
  );
  process.exit(1);
}

// Validate and sanitize inputs
function uriToCID(url) {
  const matches = url.match(/\/([a-z0-9]+)\./i);
  return matches ? matches[1] : null;
}

// Use helmet middleware to enhance security
app.use(helmet());

app.use(express.json());

// Define a route for the callback URL
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (request, response) => {
    // Local route
    // app.post("/process-data", async (request, response) => {
    try {
      if (request.body.data && request.body.data.status === "finished") {
        const cid = uriToCID(request.body.media.uri);

        if (!cid) {
          console.error("Invalid CID in the request.");
          response.status(400).json({ error: "Invalid CID" });
          return;
        }

        const provider = new ethers.WebSocketProvider(
          providerUrl,
          providerNetworkId
        );

        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          wallet
        );

        const data = JSON.stringify(request.body);
        // Estimate gas limit

        // const gasPrice = (await provider.getFeeData()).gasPrice;
        // const gasEstimation = await contract.verifyCID.estimateGas(cid, data);

        // // Set gas limit to a slightly higher value than the estimation
        // const gasLimit = gasPrice * gasEstimation;

        // Build the transaction
        const tx = await contract.verifyCID(cid, data);

        console.log("Transaction Hash:", tx.hash);
        await tx.wait();

        response.json({ received: true });
      } else {
        console.log("Ignoring request with status:", request.body.data.status);
        response.json({ received: false });
      }
    } catch (error) {
      console.error("Error:", error.message);
      response.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

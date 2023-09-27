const express = require("express");
const app = express();
const port = 3000;

const ethers = require("ethers");
require("dotenv").config();
const bodyParser = require("body-parser");
const contractABI = require("./CIDVerifier.json");
const contractAddress = process.env.CID_VERFIER_CONRACT_ADDRESS;
const privateKey = process.env.WALLET_ADDRESS;
const provider = new ethers.WebSocketProvider(
  "wss://wss.calibration.node.glif.io/apigw/lotus/rpc/v0"
);
const wallet = new ethers.Wallet(privateKey, provider);
const abi = [contractABI];
const contract = new ethers.Contract(contractAddress, abi, provider);
const connectedContract = contract.connect(wallet);

function uriToCID(url) {
  const matches = url.match(/\/([a-z0-9]+)\./i);
  return matches ? matches[1] : null;
}

app.use(express.json());

// Define a route for the callback URL
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (request, response) => {
    let event;

    try {
      if (request.body.data.status == "finished") {
        console.log("STATUS", request.body);
        // Filter CID from url
        console.log(request.body.media.uri);
        const cid = uriToCID(request.body.media.uri);
        console.log("CID", cid);

        // Add request.body to Contract
        // Call the verifyCID function
        const tx = await connectedContract.verifyCID(cid, request.body);
        await tx.wait();
      }
    } catch (error) {}

    // Acknowledge receipt
    response.json({ received: true });
  }
);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

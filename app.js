const express = require("express");
const app = express();
const port = 3000;

const ethers = require("ethers");
require("dotenv").config();
const bodyParser = require("body-parser");
const contractABI = require("./CIDVerifier.json");
const contractAddress = process.env.CID_VERFIER_CONRACT_ADDRESS.toString();
const privateKey = process.env.WALLET_ADDRESS;
const provider = new ethers.WebSocketProvider(
  "wss://ws-filecoin-calibration.chainstacklabs.com/rpc/v1",
  314159
);
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, contractABI, wallet);
// const connectedContract = contract.connect(wallet);

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
    // for local test only
    // app.post("/process-data", async (request, response) => {

    let event;

    try {
      if (request.body.data.status == "finished") {
        console.log("STATUS", request.body);
        // Filter CID from url
        console.log(request.body.media.uri);
        const cid = uriToCID(request.body.media.uri);
        console.log("CID", cid);

        console.log(wallet);
        console.log(contract);
        provider.getBlockNumber().then(console.log);
        // Add request.body to Contract
        // Call the verifyCID function
        const data = JSON.stringify(request.body);
        const tx = await contract.verifyCID(cid, data);
        // const tx = await contract.handleUnverifiedCID(cid);
        console.log("TRANSACTION", tx);
        await tx.wait();
      }
    } catch (error) {
      console.log("Error", error);
    }

    // Acknowledge receipt
    response.json({ received: true });
  }
);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

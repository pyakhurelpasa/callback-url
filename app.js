const express = require("express");
const app = express();
const port = 3000;

// mongoDB details
require("dotenv").config();
const { MongoClient } = require("mongodb");
const password = process.env.MONGODBATLAS_PASSWORD;
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

    async function run() {
      const uri =
        `mongodb+srv://pyakhurelpasa:${password}@cluster0.dgcll78.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp`.toString();

      console.log(uri);
      const client = new MongoClient(uri);

      await client.connect();

      const dbName = "ucm-test";
      const collectionName = "ContentInfo";

      // Create references to the database and collection in order to run
      // operations on them.
      const database = client.db(dbName);
      const collection = database.collection(collectionName);

      const content = [response.body];

      try {
        const insertManyResult = await collection.insertMany(content);
        console.log(
          `${insertManyResult.insertedCount} documents successfully inserted.\n`
        );
      } catch (err) {
        console.error(
          `Something went wrong trying to insert the new documents: ${err}\n`
        );
      }

      await client.close();
    }
    run().catch(console.dir);
    // Acknowledge receipt
    response.json({ received: true });
  }
);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

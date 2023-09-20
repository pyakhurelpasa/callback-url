const express = require("express");
const { MongoClient } = require("mongodb");
const password = process.env.MONGODBATLAS_PASSWORD;
const app = express();
const port = 3000;

app.use(express.json());

// Define a route for the callback URL
app.post("/webhook", (req, res) => {
  // Handle the incoming callback data here
  console.log("Received callback:", req.body);

  async function run() {
    const uri = `mongodb+srv://pyakhurelpasa:${password}@cluster0.dgcll78.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp`;

    const client = new MongoClient(uri);

    await client.connect();

    const dbName = "ucm-test";
    const collectionName = "ContentInfo";

    // Create references to the database and collection in order to run
    // operations on them.
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const recipes = [req.body];

    try {
      const insertManyResult = await collection.insertMany(recipes);
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

  res.sendStatus(200); // Send a response to acknowledge receipt
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

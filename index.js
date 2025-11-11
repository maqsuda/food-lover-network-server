const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://foodReviewDB:8INEU3elW8KzA1IT@cluster0.tbo2m.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// user: foodReviewDB
// password: 8INEU3elW8KzA1IT

async function run() {
  try {
    await client.connect();

    const db = client.db("food_reviews");
    const usersCollection = db.collection("users");
    const reviewCollection = db.collection("reviews");

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUsers = await usersCollection.findOne(query);
      if (existingUsers) {
        res.send({ message: "User already Exist. Plz try again" });
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    });

    app.get("/latest-review", async (req, res) => {
      const cursor = reviewCollection.find().sort({ Rating: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/all-reviews", async (req, res) => {
      const cursor = reviewCollection.find().sort({ reviewDate: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/all-reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.findOne(query);
      res.send(result);
    });

    app.post("/addReviews", async (req, res) => {
      const newReview = req.body;
      const result = await reviewCollection.insertOne(newReview);
      res.send(result);
    });

    //  await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// const uri =
//   "mongodb+srv://foodReviewDB:8INEU3elW8KzA1IT@cluster0.tbo2m.mongodb.net/?appName=Cluster0";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tbo2m.mongodb.net/?appName=Cluster0`;

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
    const favoriteCollection = db.collection("favorites");

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
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = reviewCollection.find(query).sort({ reviewDate: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/all-reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.findOne(query);
      res.send(result);
    });

    app.delete("/all-reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/all-reviews/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          foodName: updateData.foodName,
          foodPhoto: updateData.foodPhoto,
          restaurantName: updateData.restaurantName,
          restaurantLocation: updateData.restaurantLocation,
          rating: updateData.rating,
          reviewDate: updateData.reviewDate,
          comments: updateData.comments,
        },
      };
      const options = {};
      const result = await reviewCollection.updateOne(query, update, options);
      res.send(result);
    });

    app.post("/addReviews", async (req, res) => {
      const newReview = req.body;
      const result = await reviewCollection.insertOne(newReview);
      res.send(result);
    });

    app.post("/addFavorite", async (req, res) => {
      const newFavorite = req.body;
      const result = await favoriteCollection.insertOne(newFavorite);
      res.send(result);
    });

    app.delete("/all-favorite/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await favoriteCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/all-favorite", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = favoriteCollection.find(query).sort({ reviewDate: -1 });
      const result = await cursor.toArray();
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

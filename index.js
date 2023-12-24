const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};
app.use(cors(corsConfig));

var uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pzomx9u.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const productsCollection = client.db("skyMart").collection("products");
    const cartCollection = client.db("skyMart").collection("carts");

    // Products
    app.get("/api/v1/products", async (req, res) => {
      let query = {};

      // Searchfield
      const title = req.query.title;
      if (title) {
        query.title = { $regex: title, $options: "i" };
      }

      // Sort By Salary Range
      const sort = req.query.sort;
      const sortValue = {};
      if (sort) {
        sortValue.price = sort;
      }

      const result = await productsCollection
        .find(query)
        .sort(sortValue)
        .toArray();

      res.send({ result });
    });

    app.get("/api/v1/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });
    app.get("/api/v1/carts", async (req, res) => {
      const user = req.query.user;
      const query = { userEmail: user };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/api/v1/cart", async (req, res) => {
      const cart = req.body;
      const result = await cartCollection.insertOne(cart);
      res.send(result);
    });

    app.delete("/api/v1/cart/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(filter);
      res.send(result);
    });

    

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Sky Mart Server Side Running");
});
app.listen(port, () => {
  console.log(`Port Running On: ${port}`);
});

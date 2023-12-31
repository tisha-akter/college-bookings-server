const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u4rhioo.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const detailsCollection = client.db("CollegeBK").collection("collegeDetails");
    const usersCollection = client.db("CollegeBK").collection("users");
    const formDataCollection = client.db("CollegeBK").collection("formData");
    const reviewsCollection = client.db("CollegeBK").collection("reviews");

    app.get('/collegeDetails', async (req, res) => {
      const result = await detailsCollection.find().toArray();
      res.send(result);
    });


    // admissionForm data 
    app.post('/formData', async (req, res) => {
      try {
        const newFormData = req.body;
        const result = await formDataCollection.insertOne(newFormData);
        res.send({ insertedId: result.insertedId });
      } catch (error) {
        res.status(500).send({ error: "Internal server error" });
      }
    });


    // users related api 
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user?.email }
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: 'user already exists' })
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });



    // Create a new route for fetching reviews
    app.get('/reviews', async (req, res) => {
      try {
        const reviews = await reviewsCollection.find().toArray();
        res.json(reviews);
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Create a new route for submitting reviews
    app.post('/reviews', async (req, res) => {
      try {
        const { text, rating } = req.body;
        if (!text || !rating) {
          return res.status(400).json({ error: 'Review and rating are required' });
        }

        // Insert review into the reviews collection (replace with your MongoDB collection)
        const result = await reviewsCollection.insertOne({ text, rating });
        res.json(result.ops[0]);
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('college server is running')
})

app.listen(port, () => {
  console.log(`College Booking is running on port ${port}`);
})
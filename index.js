const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const app = express()
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
    origin: ['http://localhost:5173'],
    credentials: true,
    optionSuccessStatus: 200,
  }
  app.use(cors(corsOptions))
  app.use(express.json());

  
  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vksh2ow.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();
    const phonesCollection = client.db("PhonesDB").collection("phones");

    app.get('/phones', async (req, res)=>{
        const phones = await phonesCollection.find({}, { projection: { description: 0 } }).toArray();
        res.send(phones)
      })

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
    res.send('GadgetGlance server is running')
})

app.listen(port, () => {
    console.log(`GadgetGlance server on port ${port}`);
})
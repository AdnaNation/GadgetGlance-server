const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const app = express()
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
    origin: ['http://localhost:5173', 'https://gadgetglance-e9980.web.app'],
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
      const search = req.query.search;
      const category = req.query.category;
      const brand = req.query.brand;
      const price = req.query.price;
      const sort = req.query.sort;
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 10;
      const skip = page > 0 ? (page - 1) * limit : 0;

      let query = {};
      if(search){
        query.$or = [
          {phone_name: {$regex: search, $options: "i"}}
        ]
      }
      if(category) {
        query.category = category;
      }
      if(brand) {
        query.brand = brand;
      }

      if (price) {
        if (price === "A") {
          query.price = {
            $gte: 0,
            $lte: 100
          };
        } else if (price === "B") {
          query.price = {
            $gte: 101,
            $lte: 500
          };
        } else if (price === "C") {
          query.price = {
            $gte: 501,
            $lte: 1000
          };
        } else if (price === "D") {
          query.price = {
            $gte: 1001,
            $lte: 2000
          };
        }
      }

      let sortQuery = {}

      if (sort) {
        switch (sort) {
          case "price-low-high":
            sortQuery.price = 1; 
            break;
          case "price-high-low":
            sortQuery.price = -1; 
            break;
          default:
            break;
        }
      }

        // const phones = await phonesCollection.find({}, { projection: { description: 0 } }).toArray();
        const totalPhonesCount = await phonesCollection.countDocuments(query);
        console.log(totalPhonesCount);
        const phones = await phonesCollection
        .find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .toArray();
        res.send({phones, totalPhonesCount})
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
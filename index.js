const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cjpsvw7.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db('ToyZone').collection('services');
    const addedCollection =client.db('ToyZone').collection('added');



    app.get('/services', async(req, res)=>{
        const cursor = serviceCollection.find();
        const result =await cursor.toArray();
        console.log(result);
        res.send(result[0]);
    })

    
 
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      
      try {
        const query = { 'categories.items.toycode': parseInt(id) };
        const projection = { 'categories.items.$': 1 };
        
        const result = await serviceCollection.findOne(query, { projection });
        
        if (result) {
          const toy = result.categories[0].items[0];
          res.send(toy);
        } else {
          res.status(404).send('Toy not found');
        }
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });


    // added toys
    app.post('/added',async(req,res)=>{
        const add =req.body;
        console.log(add);

    });


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Toy is running');
});

app.listen(port, () => {
  console.log(`Toy car server is running on port ${port}`);
});
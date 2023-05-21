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
    // await client.connect();
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

    app.get('/added',async(req,res)=>{
        console.log(req.query.sellerEmail)
        let query ={};
        if (req.query?.sellerEmail){
            query ={email:req.query.sellerEmail}
        }
        const result =await addedCollection.find().toArray();
        res.send(result);

    });
    app.get('/added/:id',async(req,res)=>{
        const id =req.params.id;
        const query ={_id: new ObjectId(id)};

        const options ={
            projection:{pictureUrl:1,name:1,subCategory:1,price:1,rating:1,description:1}
        }
        const result =await addedCollection.findOne(query,options);
        res.send(result);

    });

    app.post('/added',async(req,res)=>{
        const add =req.body;
        console.log(add);
        const result =await addedCollection.insertOne(add);
        res.send(result);

    });

    app.patch('/added/:id',async(req,res)=>{
        const id = req.params.id;
        const filter ={_id: new ObjectId(id)};
        const updateAdded = req.body;
        const updateDoc ={
            $set:{
                status:updateAdded.status
            },
        };
        const result =await addedCollection.updateOne(filter,updateDoc);
        res.send(result);


    });

    app.delete('/added/:id',async(req,res)=>{
        const id =req.params.id;
        const query ={_id: new ObjectId(id)}
        const result =await addedCollection.deleteOne(query);
        res.send(result);



    });




    // await client.db("admin").command({ ping: 1 });
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
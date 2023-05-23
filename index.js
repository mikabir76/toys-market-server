const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pnta7vo.mongodb.net/?retryWrites=true&w=majority`;
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

    const toysCollection = client.db('toysShop').collection('toy');

    // Search Index
    const indexKeys = {name: 1, category: 1};
    const indexOptions = {name: "nameCategory"};
    const result = await toysCollection.createIndex(indexKeys, indexOptions)

    app.get('/toySearch/:text', async(req, res)=>{
        const searchText = req.params.text;
        console.log(searchText)
        const result = await toysCollection.find({
          $or:[
            {name: { $regex: searchText, $options: "i"}}, 
            {category: { $regex: searchText, $options: "i"}}
          ]
        }).toArray();
        res.send(result)
    })

    app.get('/addToys', async(req, res)=>{
        const cursor = toysCollection.find().limit(20)
        const result = await cursor.toArray()
        res.send(result)
    })
    app.get('/toys', async(req, res)=>{
      let query = {};
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const cursor = toysCollection.find(query).limit(20)
      const result = await cursor.toArray()
      res.send(result)
    })
    app.get('/alltoy/:text', async(req, res)=>{
      console.log(req.params.text)
      if(req.params.text == 'cricket' || req.params.text == 'football' || req.params.text == 'basketball'){

        const cursor = toysCollection.find({category: req.params.text}).limit(20)
        const result = await cursor.toArray();
        return res.send(result)
      }
      const cursor = toysCollection.find().limit(20)
        const result = await cursor.toArray();
        return res.send(result)
    })
    app.post('/addToys', async(req, res)=>{
        const toys = req.body;
        console.log(toys)
        const result = await toysCollection.insertOne(toys)
        res.send(result)
    })
    app.put('/addToys/:id',async (req, res)=>{
      const id = req.params.id;
      const body = req.body;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updateResult = {
        $set:{
          price: body.price,
          quantity: body.quantity,
          description: body.description
        }
      }
      const result = await toysCollection.updateOne(filter, updateResult, options);
      res.send(result)
    })
    app.delete('/addToys/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await toysCollection.deleteOne(query);
      res.send(result)
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



app.get('/', (req, res)=>{
    res.send('Toy Shop is running');
})

app.listen(port, ()=>{
    console.log(`Toy server running on port: ${port}`)
});








/* 





      // const sort = req.query.sort;
      //       const search = req.query.search;
      //       console.log(search);
      //       // const query = {};
      //       // const query = { price: {$gte: 50, $lte:150}};
      //       // db.InspirationalWomen.find({first_name: { $regex: /Harriet/i} })
      //       const query = {title: { $regex: search, $options: 'i'}}
      //       const options = {
      //           // sort matched documents in descending order by rating
      //           sort: { 
      //               "price": sort === 'asc' ? 1 : -1
      //           }
                
      //       };
      //       const cursor = serviceCollection.find(query, options);



*/
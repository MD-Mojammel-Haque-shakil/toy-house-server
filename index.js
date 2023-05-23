const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wyhjlgk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser:true,
  useUnifiedTopology:true,
  maxPoolSize:10,
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
  //   await client.connect((err) => {
  //     if(err){
  //         console.log(err);
  //         return
  //     }
  // });
    
    
    const toysCollection = client.db('toyUser').collection('allToys');

    app.get('/toys', async(req, res)=>{
      const tab = req.query.tab;
      if(tab){
         const result = await toysCollection.find({toyCategory:{$regex:req.query.tab, $options:'i'}}).toArray();
    return  res.send(result);
      }
      // const cursor= toysCollection.find();
      const result = await toysCollection.find({}).toArray();
      res.send(result)
  })



  app.get('/mytoys', async(req, res)=>{

    // const cursor= toysCollection.find();
    const queary = {sellerEmail: req.query.email}
    console.log(queary)
    const result = await toysCollection.find(queary).toArray();
    res.send(result)
})
 app.delete('/mytoys/:id', async(req, res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await toysCollection.deleteOne(query);
    res.send(result)
})

app.put('/toys/:id', async(req, res)=>{
  const id = req.params.id;
  const filter = {_id: new ObjectId(id)}
  const options = {upsert: true};
  const updateToy = req.body;
  const toy = {
    $set: {
      price: updateToy.price,
      quantity: updateToy.quantity,
      details: updateToy.details
    }
  }
  const result = await toysCollection.updateOne(filter, toy, options);
  res.send(result)
}) 

    app.get('/toys/:id', async(req, res)=>{
    const id = req.params.id;
    const queary = {_id: new ObjectId(id)}
    const result = await toysCollection.findOne(queary);
    res.send(result);
    
   }) 

  
  

 //send data mongodb via post 
    app.post('/toysinfo', async(req, res)=>{
        const toyInfo = req.body;
        console.log(toyInfo)
        const result = await toysCollection.insertOne(toyInfo);
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



app.get('/', (req,res)=>{
    res.send('toys home is running')
})

app.listen(port, ()=>{
    console.log(`toy house server is running on port${port}`)
})
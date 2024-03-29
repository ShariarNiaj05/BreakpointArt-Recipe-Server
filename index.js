require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://breakpointart-recipe-task.web.app',
    'https://breakpointart-recipe-task.firebaseapp.com/'

  ],

}))
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qiowubl.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const recipeCollection = client.db('jobTaskDB').collection('BreakpointArt')

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    app.get('/all-recipe', async (req, res) => {
      const searchQuery = req.query.search;
      const regex = new RegExp(searchQuery, 'i');

      const result = await recipeCollection.find({
        $or: [
          { title: { $regex: regex } },
          { ingredients: { $elemMatch: { $regex: regex } } },
        ],
      }).toArray();

      res.send(result);
    })


    app.get('/recipe-details/:id', async (req, res) => {
      const id = req.params.id
      console.log(id);
      const filter = { _id: new ObjectId(id) }
      const result = await recipeCollection.findOne(filter);
      res.send(result)
    })


    app.put('/recipe', async (req, res) => {
      const recipe = req.body;
      // console.log(recipe);
      const result = await recipeCollection.insertOne(recipe)
      res.send(result)
    })


    app.put('/tasks', async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task)
      res.send(result)
    })


    app.put('/update-recipe/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const body = req.body;
      // console.log('Received body:', body);

      // console.log( query, body);
      const updatedRecipe = {
        $set: {
          ...body
        }
      }
      const option = { upsert: true }
      const result = await recipeCollection.updateOne(query, updatedRecipe, option)
      // console.log(result);
      res.send(result)
    })



    app.delete('/recipe/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) }
      const result = await recipeCollection.deleteOne(query)
      res.send(result)

    })




    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('BreakPointArt Recipe server is running')
})

app.listen(port, () => {
  console.log(`BreakPointArt Recipe server is running on the port: ${port}`);
})
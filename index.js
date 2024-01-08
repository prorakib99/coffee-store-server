const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fyh6bpe.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();

        const database = client.db("coffeesDB");
        const coffeesCollection = database.collection("coffees");

        app.get('/coffees', async (req, res) => {
            const cursor = coffeesCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })
        
        app.post('/coffees', async (req, res) => {
            const newCoffee = req.body;         
            const result = await coffeesCollection.insertOne(newCoffee);
            res.send(result)
        })

        app.get('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const result = await coffeesCollection.findOne(filter);
            res.send(result)
        })

        app.put('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const updatedCoffee = req.body;
            const filter = {_id: new ObjectId(id)};
            const options = { upsert: true };
            const setCoffee = {
                $set: {
                    name: updatedCoffee.name, 
                    price: updatedCoffee.price, 
                    chef: updatedCoffee.chef, 
                    supplier: updatedCoffee.supplier, 
                    taste: updatedCoffee.taste, 
                    category: updatedCoffee.category, 
                    details: updatedCoffee.details, 
                    photo: updatedCoffee.photo
                }
            }
            const result = await coffeesCollection.updateOne(filter, setCoffee, options);
            res.send(result);
        })

        app.delete('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await coffeesCollection.deleteOne(query);
            res.send(result)
        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Coffee Making server is running')
})


app.listen(port, () => {
    console.log(`Coffee Server running on port: ${port}`)
})
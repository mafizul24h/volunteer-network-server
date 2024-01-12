const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k95s6zq.mongodb.net/?retryWrites=true&w=majority`;

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

        const eventCollections = client.db('volunteerDB').collection('events');

        app.get('/events', async (req, res) => {
            const result = await eventCollections.find().sort({ entryDate: -1 }).toArray();
            res.send(result);
        })

        app.post('/events', async (req, res) => {
            const event = req.body;
            event.entryDate = new Date();
            const result = await eventCollections.insertOne(event);
            res.send(result);
            // console.log(result);
        })

        app.get('/my-events', async (req, res) => {
            const email = req.query.email;
            // console.log(email);
            const filter = { email: email };
            const result = await eventCollections.find(filter).sort({ entryDate: -1 }).toArray()
            // console.log(result);
            res.send(result)
        });

        app.get('/event/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await eventCollections.findOne(query);
            res.send(result);
        })

        app.patch('/updateEvent/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const event = req.body;
            event.entryDate = new Date();
            const updateEvent = {
                $set: {
                    ...event
                }
            }
            const result = await eventCollections.updateOne(filter, updateEvent);
            res.send(result);
            // console.log(result);
        })

        app.delete('/event/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await eventCollections.deleteOne(filter);
            res.send(result);
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
    res.send('Volunteer Network Server Running');
})

app.listen(port, () => {
    console.log(`Volunteer Network Server Running Port ${port}`);
})
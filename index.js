const express = require('express')
const cors = require("cors")
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()

const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kjebueb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


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

            const taskCollection = client.db("taskDB").collection("tasks");

            app.get("/tasks", async (req, res) => {
                  let searchTerm = "";
                  if (req?.query?.searchTerm) {
                        searchTerm = req.query.searchTerm;
                  }

                  const tasks = await taskCollection.find({
                        $or: ["title", "description"].map(field => ({
                              [field]: { $regex: searchTerm, $options: "i" }
                        }))
                  }).toArray();

                  res.status(200).json({
                        success: true,
                        message: 'Tasks retrieved successfully',
                        tasks
                  });
            });


            app.get("/tasks/:id", async (req, res) => {
                  const id = req.params.id
                  const query = { _id: new ObjectId(id) }
                  const task = await taskCollection.findOne(query)
                  res.status(200).json({
                        success: true,
                        message: 'Task Retrieved successfully',
                        task
                  });

            })
            app.put("/tasks/:id", async (req, res) => {
                  try {
                        const id = req.params.id;
                        const query = { _id: new ObjectId(id) };
                        const updateTask = req.body;
                        const taskToUpdate = {
                              $set: {
                                    title: updateTask.title,
                                    description: updateTask.description,
                                    priority: updateTask.priority
                              }
                        };
                        const result = await taskCollection.updateOne(query, taskToUpdate);
                        res.status(200).json({
                              success: true,
                              message: 'Task updated successfully',
                              result
                        });

                  } catch (error) {
                        console.error('Update failed:', error);
                        res.status(500).json({
                              success: false,
                              message: 'Internal server error'
                        });
                  }
            });

            app.post("/tasks", async (req, res) => {
                  const task = req.body
                  console.log(task)
                  await taskCollection.insertOne(task)
                  res.status(201).json({
                        success: true,
                        message: 'Task Added successfully',
                  });
            })

            app.delete("/tasks/:id", async (req, res) => {
                  const id = req.params.id
                  const query = { _id: new ObjectId(id) }
                  await taskCollection.deleteOne(query)
                  res.status(201).json({
                        success: true,
                        message: 'Task is Deleted',
                  });
            })

            // await client.db("admin").command({ ping: 1 });
            // console.log("Pinged your deployment. You successfully connected to MongoDB!");
      } finally {

            // await client.close();
      }
}
run().catch(console.dir);


app.get('/', (req, res) => {
      res.send('Todo App Server is Running')
})

app.listen(port, () => {
      console.log(`Todo listening on port ${port}`)
})
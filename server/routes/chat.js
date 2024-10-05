const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const router = express.Router();

// MongoDB connection URI and database name
const uri = "mongodb://127.0.0.1:27017";
const dbName = "chatdb";  // You can use a different database for chat messages
const client = new MongoClient(uri);

let db, collection;

// Connect to MongoDB
client
  .connect()
  .then(() => {
    db = client.db(dbName);
    collection = db.collection("messages");  // Collection for storing chat messages
    console.log("Connected to MongoDB (Chat)");
  })
  .catch((err) => console.error("Error connecting to MongoDB", err));

// GET /chat/messages - Get all chat messages for a room
router.get("/:room", async (req, res) => {
  const { room } = req.params;
  try {
    const messages = await collection.find({ room }).toArray();  // Fetch messages for the room
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error });
  }
});

// POST /chat/messages - Add a new chat message
router.post("/", async (req, res) => {
  const { room, sender, message } = req.body;

  try {
    const result = await collection.insertOne({
      room,
      sender,
      message,
      timestamp: new Date(),
    });
    res.status(201).json({ message: "Message added", messageId: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: "Error adding message", error });
  }
});

module.exports = router;

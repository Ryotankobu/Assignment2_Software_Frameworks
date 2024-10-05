const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
const mongoose = require("mongoose");  // Import Mongoose
const Message = require("./models/Message");  // Import the Message model

const app = express();
const server = http.createServer(app);

// Middleware to parse JSON and handle CORS
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Connect to MongoDB
const mongoURI = "mongodb://localhost:27017/chatdb";  // Modify with your MongoDB URI
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Setup Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Define rooms globally
const rooms = ["room1", "room2", "room3", "room4"]; // You can modify this list

// Handle connection to the /chat namespace
const chat = io.of("/chat"); // Create a namespace for /chat

chat.on("connection", (socket) => {
  console.log("A user connected to /chat namespace with socket ID:", socket.id);

  // Send the room list to the newly connected user
  socket.emit("roomlist", JSON.stringify(rooms));

  // Handle room joining
  socket.on("joinRoom", async (room) => {
    if (rooms.includes(room)) {
      socket.join(room);
      console.log(`User with ID ${socket.id} joined room ${room}`);

      // Fetch chat history for the room from MongoDB
      const chatHistory = await Message.find({ room }).sort({ timestamp: 1 });
      socket.emit("chatHistory", chatHistory);  // Send chat history to the client

      chat.to(room).emit("joined", room);  // Notify the user in the room
    } else {
      console.log(`Room ${room} does not exist.`);
    }
  });

  // Handle message broadcasting to a room and save to MongoDB
 socket.on("message", async (data) => {
   console.log('Received message data from client:', data);  // Log received data
   const { message, room, sender } = data;

   // Save the message to MongoDB
   const newMessage = new Message({ room, sender, message });
   await newMessage.save();

   // Emit the message to all users in the room
   chat.to(room).emit("message", { sender, message });
   console.log('Broadcasting message to room:', room, { sender, message });  // Log broadcast data
 });


  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Import and use modular routes (if you have any)
const loginRoutes = require("./routes/login");
loginRoutes.route(app);

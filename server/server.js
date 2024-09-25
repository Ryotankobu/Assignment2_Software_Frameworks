const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");

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
  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`User with ID ${socket.id} joined room ${room}`);
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Import and use modular routes (if you have any)
const loginRoutes = require("./routes/login");
loginRoutes.route(app);

// Starting the server using modularized listen function
const listen = require("./routes/listen");
const PORT = process.env.PORT || 3001;
listen.listen(server, PORT);

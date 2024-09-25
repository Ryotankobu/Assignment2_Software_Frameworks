module.exports = function (io) {
  const chat = io.of("/chat");
  const rooms = ["room1", "room2", "room3", "room4"]; // Predefined rooms
  const socketRoom = [];
  const socketRoomnum = [];

  chat.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    // Send the current room list to the newly connected user
    socket.emit("roomlist", JSON.stringify(rooms));

    // Handle user joining a room
    socket.on("joinRoom", (room) => {
      if (rooms.includes(room)) {
        socket.join(room);
        console.log(`${socket.id} joined room: ${room}`);

        // Track the socket and the room it's in
        socketRoom.push([socket.id, room]);

        // Track the number of users in the room
        let roomExists = false;
        for (let i = 0; i < socketRoomnum.length; i++) {
          if (socketRoomnum[i][0] === room) {
            socketRoomnum[i][1]++;
            roomExists = true;
            break;
          }
        }
        if (!roomExists) {
          socketRoomnum.push([room, 1]);
        }

        // Notify all users in the room
        chat.in(room).emit("notice", `A new user has joined room ${room}`);
        chat.in(room).emit("joined", room);

        // Broadcast updated room user count to everyone
        broadcastRoomUsers(room);
      }
    });

    // Handle user leaving a room
    socket.on("leaveRoom", (room) => {
      socket.leave(room);
      console.log(`${socket.id} left room: ${room}`);

      // Remove user from room tracking
      for (let i = 0; i < socketRoom.length; i++) {
        if (socketRoom[i][0] === socket.id && socketRoom[i][1] === room) {
          socketRoom.splice(i, 1);
          break;
        }
      }

      // Update the room user count
      for (let i = 0; i < socketRoomnum.length; i++) {
        if (socketRoomnum[i][0] === room) {
          socketRoomnum[i][1]--;
          if (socketRoomnum[i][1] === 0) {
            socketRoomnum.splice(i, 1); // If no users left, remove the room from the list
          }
          break;
        }
      }

      // Notify all users in the room
      chat.in(room).emit("notice", `A user has left room ${room}`);

      // Broadcast updated room user count to everyone
      broadcastRoomUsers(room);
    });

    // Handle new messages
    socket.on("message", (message) => {
      let userRoom = socketRoom.find(([id, room]) => id === socket.id);
      if (userRoom) {
        chat.to(userRoom[1]).emit("message", message);
      }
    });

    // Handle room creation
    socket.on("newroom", (newroom) => {
      console.log("New room creation request:", newroom);
      if (!rooms.includes(newroom)) {
        rooms.push(newroom);
        console.log(`Room ${newroom} created.`);
        chat.emit("roomlist", JSON.stringify(rooms)); // Broadcast the new room list to all clients
      }
    });

    // Send the room list to the client when requested
    socket.on("roomlist", () => {
        console.log("Sending room list to client");
      socket.emit("roomlist", JSON.stringify(rooms));
    });

    // Send the number of users in a room
    socket.on("numbers", (room) => {
      let roomData = socketRoomnum.find(([r]) => r === room);
      if (roomData) {
        chat.in(room).emit("numbers", roomData[1]);
      }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      // Remove user from all rooms they were in
      let roomToLeave = null;
      for (let i = 0; i < socketRoom.length; i++) {
        if (socketRoom[i][0] === socket.id) {
          roomToLeave = socketRoom[i][1];
          socketRoom.splice(i, 1); // Remove from room tracking
          break;
        }
      }

      if (roomToLeave) {
        for (let i = 0; i < socketRoomnum.length; i++) {
          if (socketRoomnum[i][0] === roomToLeave) {
            socketRoomnum[i][1]--;
            if (socketRoomnum[i][1] === 0) {
              socketRoomnum.splice(i, 1); // If no users left, remove the room from the list
            }
            break;
          }
        }
        // Notify remaining users in the room and update the room list
        chat.in(roomToLeave).emit("notice", `A user has disconnected`);
        broadcastRoomUsers(roomToLeave);
      }
    });

    // Broadcast the updated number of users in the room
    function broadcastRoomUsers(room) {
      let roomData = socketRoomnum.find(([r]) => r === room);
      if (roomData) {
        chat.in(room).emit("numbers", roomData[1]);
      }
    }
  });
};

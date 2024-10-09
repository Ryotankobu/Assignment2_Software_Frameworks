
# 3813ICT Software Frameworks Assignment Phase 1 (Ryota Ando / s5298111)
# Repository Url: https://github.com/Ryotankobu/Assignment2_Software_Frameworks.git



## Table of Contents

1. [Description of Data Structures Used in Client and Server](#description-of-data-structures-used-in-client-and-server)
2. [Division of Responsibilities Between Client and Server](#division-of-responsibilities-between-client-and-server)
3. [List of Routes, Parameters, Return Values, and Purpose](#list-of-routes-parameters-return-values-and-purpose)
4. [Angular Architecture: Components, Services, Models, Routes](#angular-architecture-components-services-models-routes)
5. [Interaction Between Client and Server](#interaction-between-client-and-server)

---

## 1. Description of Data Structures Used in Client and Server

In this project, data structures are essential for organizing the various entities like users, groups, and messages. Both the client and server need to manage these entities effectively to support real-time communication and role-based functionalities.

### Client-Side Data Structures:

- **User**: The user structure on the client side contains fields such as `username`, `role`, and `groups`. It determines the current user's identity and their permissions, such as whether they are a Super Admin, Group Admin, or Chat User. The user data is stored in session storage and retrieved when needed to adjust the UI accordingly.
  
- **Groups**: Groups represent the chat rooms users belong to. On the client side, this data is typically stored in an array associated with the user and displayed on the screen. When a user selects a group, they can see or participate in the chat within that group.

- **Messages**: Messages are represented as simple objects containing properties such as `sender`, `message`, and `timestamp`. These structures are used to manage real-time communication in the chat rooms and display messages to users.

### Server-Side Data Structures:

- **User**: On the server side, users are stored in a MongoDB database with fields such as `email`, `username`, `role`, and `groups`. The structure includes arrays for the groups the user is part of, as well as additional fields for role-based permissions.

- **Message**: Messages sent in chat rooms are stored in MongoDB with fields for `room`, `sender`, `message`, and `timestamp`. This structure allows for chat history to be saved and retrieved later.

- **Groups**: Groups are stored on the server side as distinct entities, managing which users belong to them and the messages associated with them. This ensures that when a user sends a message, it's directed to the correct group and saved.

---

## 2. Division of Responsibilities Between Client and Server

A clear division of responsibilities between the client and server is key to maintaining a well-structured application. This chat app leverages the client for the user interface and real-time interaction, while the server manages data persistence, user authentication, and message broadcasting.

### Client-Side Responsibilities:

- **User Interface**: The client is responsible for rendering the user interface using Angular components, handling user interactions like joining chat rooms, sending messages, and updating the chat feed in real time. 

- **Real-Time Interaction**: Through WebSocket (Socket.IO) connections, the client handles real-time communication, sending and receiving messages directly from the server. The client-side code is responsible for updating the chat view based on the server’s responses.

- **Session Management**: The client manages session storage to maintain the logged-in user's data (e.g., username, role) and uses this data to adjust the visible options for Super Admins, Group Admins, and Chat Users.

### Server-Side Responsibilities:

- **User Authentication**: The server provides authentication and authorization by verifying user credentials. It ensures that users can only access the features their role permits, using routes to check login data.

- **Data Persistence**: The server stores users, messages, and groups in a MongoDB database. This allows for persisting chat history and retrieving it when a user reconnects.

- **REST API and WebSocket Handling**: The server exposes RESTful routes for user management (e.g., promoting to Group Admin, creating groups) and manages WebSocket communication for real-time message broadcasting.

---

## 3. List of Routes, Parameters, Return Values, and Purpose

The backend defines several routes that the client can interact with. These routes handle both RESTful and real-time WebSocket interactions.

### RESTful Routes:

- **POST /login**  
  *Parameters:* `email`, `password`  
  *Returns:* A JSON object containing user information (username, role, groups).  
  *Purpose:* Authenticates the user and returns their role and group details.

- **POST /promoteToGroupAdmin**  
  *Parameters:* `username`  
  *Returns:* A success message.  
  *Purpose:* Promotes a specified user to Group Admin.

- **POST /createGroup**  
  *Parameters:* `groupName`  
  *Returns:* A success message.  
  *Purpose:* Allows Group Admins to create a new chat group.

- **POST /removeUser**  
  *Parameters:* `username`  
  *Returns:* A success message.  
  *Purpose:* Allows Super Admins to remove a user from the system.

### WebSocket Events:

- **joinRoom**  
  *Parameters:* `room`  
  *Purpose:* Allows a user to join a specific chat room. The server then sends the chat history of that room.

- **message**  
  *Parameters:* `message`, `room`  
  *Purpose:* Sends a message to a specific room, and the server broadcasts it to all participants in that room.

---

## 4. Angular Architecture: Components, Services, Models, Routes

The Angular frontend is structured with a clear separation of concerns, making use of components, services, models, and routing to maintain organization and scalability.

### Components:
- **AppComponent**: This is the root component of the application. It contains the overall layout and includes other components like the header.
- **LoginComponent**: Handles the user login process, capturing user credentials and passing them to the server for authentication.
- **ChatComponent**: Displays the chat interface, allowing users to join rooms, send messages, and view chat history.
- **AdminComponent**: Provides Super Admin and Group Admin functionalities such as promoting users and creating/removing groups.

### Services:
- **SocketService**: Manages all real-time communication with the server through WebSocket (Socket.IO). This service sends and receives messages and listens for room join and leave events.
- **AuthService**: Handles user authentication, making API calls to the backend to log users in and manage their session data.

### Models:
- **User**: A model that represents the structure of a user, containing fields like `username`, `role`, and `groups`.
- **Message**: A model for representing chat messages, with fields for `sender`, `message`, and `timestamp`.

### Routes:
- `/login`: Directs to the login page for authentication.
- `/chat`: Directs to the chat interface where users can participate in group chats.
- `/admin`: Accessible only to Super Admins and Group Admins, allowing management of users and groups.

---

## 5. Interaction Between Client and Server

The interaction between the client and server is crucial for maintaining a real-time chat environment. Here’s how the communication flow works:

### Login Process:
When a user logs in, the client sends their credentials (email and password) via a `POST` request to the `/login` endpoint. The server checks these credentials against the database and responds with the user's role and group information. This data is stored in the client’s session storage and used throughout the session to display the appropriate UI components.

### Joining a Room:
When a user selects a room to join, a WebSocket event (`joinRoom`) is emitted from the client to the server. The server adds the user to the room, retrieves the chat history from the database, and sends it back to the client via another WebSocket event (`chatHistory`).

### Sending Messages:
The client sends a message through the WebSocket connection by emitting a `message` event. The server receives the message, stores it in MongoDB, and broadcasts it to all users in the room. This real-time interaction ensures that all participants see the message without refreshing the page.

### Server-Side Changes:
When a new message is sent, it’s stored in the MongoDB `messages` collection. Similarly, user-related actions like promoting users or creating groups trigger updates in the `users` and `groups` collections.

### Client-Side Updates:
The UI is dynamically updated as new messages are received via WebSocket events. Angular’s two-way data binding ensures that changes in the data model (e.g., a new message or group being created) immediately reflect in the UI without requiring a page reload.

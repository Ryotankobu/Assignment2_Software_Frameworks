module.exports = {
  route: (app) => {
    class User {
      constructor(
        username,
        birthday,
        age,
        email,
        password,
        valid,
        canCreateGroup,
        groups = [],
        channels = [], // Channels for chat messages
        role = "ChatUser" // Default role as ChatUser
      ) {
        this.username = username;
        this.birthday = birthday;
        this.age = age;
        this.email = email;
        this.password = password;
        this.valid = valid;
        this.canCreateGroup = canCreateGroup;
        this.groups = groups;
        this.channels = channels; // Keep track of channels the user is in
        this.role = role;
      }
    }

    // Example users
    const users = [
      new User(
        "super",
        "1980-01-01",
        44,
        "superadmin@example.com",
        "123",
        true,
        true,
        ["room1", "room2"],
        ["channel1"],
        "SuperAdmin"
      ),
      new User(
        "GroupAdmin",
        "1990-01-01",
        34,
        "groupadmin@example.com",
        "123",
        true,
        true,
        ["room1", "room2"],
        ["channel1"],
        "GroupAdmin"
      ),
      new User(
        "ChatUser",
        "2000-01-01",
        24,
        "chatuser@example.com",
        "123",
        true,
        false,
        ["room2", "room3"],
        ["channel2"],
        "ChatUser"
      ),
    ];

    // LOGIN HANDLER
    app.post("/api/auth", (req, res) => {
      const { username, password } = req.body;

      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        res.json({
          valid: true,
          userInfo: {
            username: user.username,
            email: user.email,
            role: user.role,
            groups: user.groups,
            channels: user.channels,
          },
        });
      } else {
        res.status(401).json({
          valid: false,
          message: "Invalid username or password",
        });
      }
    });

    // Admin Feature 1: promote a user to Group Admin
    app.post("/api/promotetogroupadmin", (req, res) => {
      const { username } = req.body;

      const user = users.find((u) => u.username === username);

      if (user && user.role === "ChatUser") {
        user.role = "GroupAdmin";
        res.json({ message: `${username} promoted to Group Admin!` });
      } else if (user && user.role === "GroupAdmin") {
        res
          .status(400)
          .json({ message: `${username} is already a Group Admin` });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    });

    // Admin Feature 2: remove a user
    app.post("/api/removeuser", (req, res) => {
      const { username } = req.body;
      const userIndex = users.findIndex((u) => u.username === username);

      if (userIndex === -1) {
        return res.status(404).json({ message: "User not found." });
      }

      users.splice(userIndex, 1);
      res.status(200).json({
        message: `User with username ${username} removed successfully.`,
      });
    });

    // Admin Feature 3: upgrade a user to Super Admin
    app.post("/api/upgradetosuperadmin", (req, res) => {
      const { username } = req.body;
      const user = users.find((u) => u.username === username);

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      if (user.role === "SuperAdmin") {
        return res
          .status(400)
          .json({ message: `${username} is already a Super Admin.` });
      }

      user.role = "SuperAdmin";
      res
        .status(200)
        .json({ message: `${username} upgraded to Super Admin successfully!` });
    });

    // Group admin Feature 1: Create a new group
    app.post("/api/creategroup", (req, res) => {
      const { username, groupName } = req.body;
      // Debugging: log the incoming request details
      console.log("Received request to create group");
      console.log("Username:", username);
      console.log("Group Name:", groupName);

      // Find the user by username
      const user = users.find((u) => u.username === username);

      if (!user || user.role !== "GroupAdmin") {
        return res
          .status(403)
          .json({ message: "You do not have permission to create a group." });
      }

      // Debugging: Check if user was found
      if (!user) {
        console.log("User not found");
        return res.status(403).json({ message: "User not found." });
      }

      // Debugging: Check if user has GroupAdmin role
      if (user.role !== "GroupAdmin") {
        console.log("User does not have GroupAdmin role:", user.role);
        return res
          .status(403)
          .json({ message: "You do not have permission to create a group." });
      }

      // Logic to create the group
      if (!user.groups.includes(groupName)) {
        user.groups.push(groupName);
        console.log("Group created successfully:", groupName);
        return res.status(201).json({
          message: `Group ${groupName} created successfully!`,
          groups: user.groups,
        });
      } else {
        console.log("Group already exists:", groupName);
        return res
          .status(400)
          .json({ message: `Group ${groupName} already exists.` });
      }
    });


    // Group admin Feature 2: Remove a group
    app.post("/api/removegroup", (req, res) => {
      const { username, groupName } = req.body;

      // Find the user by username
      const user = users.find((u) => u.username === username);

      if (!user || user.role !== "GroupAdmin") {
        return res
          .status(403)
          .json({ message: "You do not have permission to remove a group." });
      }

      // Check if the group exists
      const groupIndex = user.groups.indexOf(groupName);
      if (groupIndex === -1) {
        return res
          .status(404)
          .json({ message: `Group ${groupName} not found.` });
      }

      // Remove the group from the array
      user.groups.splice(groupIndex, 1);

      return res.status(200).json({
        message: `Group ${groupName} removed successfully!`,
        groups: user.groups, // Return the updated list of groups
      });
    });

    // ChatUser Feature 1: Create a new chat user (username must be unique)
    app.post("/api/createuser", (req, res) => {
      const { username, birthday, age, email, password } = req.body;

      if (users.find((u) => u.username === username)) {
        return res.status(400).json({ message: "Username already exists!" });
      }

      const newUser = new User(
        username,
        birthday,
        age,
        email,
        password,
        true,
        false,
        [],
        [],
        "ChatUser"
      );
      users.push(newUser);

      res.status(201).json({
        message: "New chat user created successfully!",
        user: newUser,
      });
    });

    // ChatUser Feature 2: A chat user can join a channel in a group
    app.post("/api/joinchannel", (req, res) => {
      const { email, group, channel } = req.body;

      const user = users.find((u) => u.email === email);
      if (!user || !user.groups.includes(group)) {
        return res.status(400).json({ message: "User not part of the group." });
      }

      if (user.channels.includes(channel)) {
        return res.status(400).json({ message: "Already in the channel." });
      }

      user.channels.push(channel);
      res.status(200).json({
        message: `Joined channel ${channel} successfully.`,
        channels: user.channels,
      });
    });

    // ChatUser Feature 3: A chat user can register an interest in a group
    app.post("/api/registerinterest", (req, res) => {
      const { email, group } = req.body;

      const user = users.find((u) => u.email === email);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Logic to notify group admin to add the user
      res.status(200).json({
        message: `Interest registered to join group ${group}. Waiting for admin approval.`,
      });
    });

    // ChatUser Feature 4: A chat user can leave a group
    app.post("/api/leavegroup", (req, res) => {
      const { email, group } = req.body;

      const user = users.find((u) => u.email === email);
      if (!user || !user.groups.includes(group)) {
        return res
          .status(404)
          .json({ message: "Group not found or user is not a member." });
      }

      const groupIndex = user.groups.indexOf(group);
      user.groups.splice(groupIndex, 1);
      res.status(200).json({
        message: `Successfully left group ${group}.`,
        groups: user.groups,
      });
    });

    // ChatUser Feature 5: A chat user can delete themselves
    app.post("/api/deleteuser", (req, res) => {
      const { email } = req.body;

      const userIndex = users.findIndex((u) => u.email === email);
      if (userIndex === -1) {
        return res.status(404).json({ message: "User not found." });
      }

      users.splice(userIndex, 1);
      res
        .status(200)
        .json({ message: `User with email ${email} deleted successfully.` });
    });

    // ChatUser Feature 6: A chat user is uniquely identified by their Username
    app.get("/api/getuserbyusername/:username", (req, res) => {
      const { username } = req.params;

      const user = users.find((u) => u.username === username);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      res.status(200).json({ user });
    });

    // ChatUser Feature 7: A chat user may logout
    app.post("/api/logout", (req, res) => {
      // Logic for logging out (usually involves clearing session data on the client)
      res.status(200).json({ message: "User logged out successfully." });
    });
  },
};

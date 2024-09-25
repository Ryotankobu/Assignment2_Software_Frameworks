module.exports = {
  listen: (server, PORT) => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  },
};

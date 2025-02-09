const socketHandler = (io) => {
    io.on("connection", (socket) => {
      console.log("🔗 Nutzer verbunden");
  
      socket.on("newTodo", (todo) => {
        io.emit("updateTodos", todo);
      });
  
      socket.on("deleteTodo", (id) => {
        io.emit("removeTodo", id);
      });
  
      socket.on("disconnect", () => {
        console.log("❌ Nutzer getrennt");
      });
    });
  };
  
  module.exports = socketHandler;
  
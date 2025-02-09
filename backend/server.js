const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createServer } = require("http");
const { Server } = require("socket.io");

dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const todoRoutes = require("./routes/todoRoutes");
app.use("/todos", todoRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running! 🚀");
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("newTodo", (todo) => {
    io.emit("updateTodos", todo);
  });

  socket.on("deleteTodo", (id) => {
    io.emit("removeTodo", id);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);


server.listen(process.env.PORT, () => console.log(`🚀 Server running on http://localhost:3001`));

//server.listen(process.env.PORT, () => console.log(`🚀 Server running on http://localhost:${process.env.PORT}`));

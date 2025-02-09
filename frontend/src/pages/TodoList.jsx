import { useEffect, useState } from "react";
import { getTodos, addTodo, deleteTodo } from "../services/api";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export default function TodoList({ token, setToken }) {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    getTodos(token).then((res) => setTodos(res.data));

    socket.on("updateTodos", (todo) => {
      setTodos((prev) => [...prev, todo]);
    });

    socket.on("removeTodo", (id) => {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    });

    return () => {
      socket.off("updateTodos");
      socket.off("removeTodo");
    };
  }, [token]);

  const handleAddTodo = async () => {
    const res = await addTodo(token, { text: newTodo });
    setTodos([...todos, res.data]);
    setNewTodo("");
  };

  const handleDeleteTodo = async (id) => {
    await deleteTodo(token, id);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div>
      <h2>To-Do List</h2>
      <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder="New task" />
      <button onClick={handleAddTodo}>Add</button>
      <button onClick={handleLogout}>Logout</button>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.text}
            <button onClick={() => handleDeleteTodo(todo.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

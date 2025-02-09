import { useEffect, useState } from "react";
import { getTodos, addTodo } from "../services/api";

export default function TodoList({ token }) {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    getTodos(token).then((res) => setTodos(res.data));
  }, [token]);

  const handleAddTodo = async () => {
    const res = await addTodo(token, { text: newTodo });
    setTodos([...todos, res.data]);
  };

  return (
    <div>
      <input value={newTodo} onChange={(e) => setNewTodo(e.target.value)} />
      <button onClick={handleAddTodo}>Add</button>
      <ul>{todos.map((t) => <li key={t.id}>{t.text}</li>)}</ul>
    </div>
  );
}

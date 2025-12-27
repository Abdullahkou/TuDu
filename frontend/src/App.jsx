import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TaskList from "./pages/TaskList";
import CreateTask from "./pages/CreateTask";
import Calendar from "./pages/Calendar";
import Statistics from "./pages/Statistics";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState(localStorage.getItem("username"));

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setToken(null);
      setUsername(null);
    }
  }, []);

  const handleLogin = (newToken, newUsername) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("username", newUsername);
    setToken(newToken);
    setUsername(newUsername);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          token ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/register" element={
          token ? <Navigate to="/" replace /> : <Register onLogin={handleLogin} />
        } />

        <Route path="/" element={
          token ? <TaskList token={token} username={username} onLogout={handleLogout} /> : <Navigate to="/login" replace />
        } />
        <Route path="/create" element={
          token ? <CreateTask token={token} username={username} onLogout={handleLogout} /> : <Navigate to="/login" replace />
        } />
        <Route path="/calendar" element={
          token ? <Calendar token={token} username={username} onLogout={handleLogout} /> : <Navigate to="/login" replace />
        } />
        <Route path="/statistics" element={
          token ? <Statistics token={token} username={username} onLogout={handleLogout} /> : <Navigate to="/login" replace />
        } />

        <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

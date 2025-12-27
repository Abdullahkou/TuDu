import { useState } from "react";
import { register } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Bitte alle Felder ausfüllen");
      return;
    }
    if (password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen haben");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await register({ username, password });
      if (res.data.token) {
        onLogin(res.data.token, res.data.user?.username || username);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Registrierung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>TuDu</h1>
        <h2>Konto erstellen</h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Benutzername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Passwort (min. 6 Zeichen)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <button type="submit" disabled={loading}>
            {loading ? "..." : "Registrieren"}
          </button>
        </form>

        <p className="auth-link">
          Bereits registriert? <Link to="/login">Anmelden</Link>
        </p>
      </div>
    </div>
  );
}

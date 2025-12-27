import { useState, useEffect } from "react";
import { addTodo, getGroups, createGroup } from "../services/api";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

export default function CreateTask({ token, username, onLogout }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [plannedDate, setPlannedDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState("");
    const [newGroupName, setNewGroupName] = useState("");
    const [showNewGroup, setShowNewGroup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        try {
            const res = await getGroups(token);
            setGroups(res.data || []);
        } catch (err) {
            console.error("Failed to load groups:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setError("Bitte einen Titel eingeben");
            return;
        }

        setLoading(true);
        setError("");

        try {
            let groupId = selectedGroup || null;

            if (showNewGroup && newGroupName.trim()) {
                try {
                    const res = await createGroup(token, newGroupName.trim());
                    groupId = res.data.id;
                } catch (groupErr) {
                    console.error("Group creation failed:", groupErr);
                    setError("Fehler beim Erstellen der Liste");
                    setLoading(false);
                    return;
                }
            }

            const formatDate = (dateStr) => {
                if (!dateStr) return null;
                return new Date(dateStr).toISOString();
            };

            await addTodo(token, {
                text: title.trim(),
                description: description.trim() || "",
                group_id: groupId,
                planned_date: formatDate(plannedDate),
                due_date: formatDate(dueDate),
                priority: priority
            });

            navigate("/");
        } catch (err) {
            console.error("Task creation failed:", err);
            setError(err.response?.data?.msg || "Fehler beim Erstellen");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout activePage="create" onLogout={onLogout} username={username}>
            <div className="page-container">
                <div className="card">
                    <h2>Neuer Task</h2>

                    {error && <div className="error-msg">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Titel *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Was möchtest du erledigen?"
                            />
                        </div>

                        <div className="form-group">
                            <label>Beschreibung</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Weitere Details..."
                                rows={3}
                            />
                        </div>

                        <div className="form-group">
                            <label>Liste</label>
                            {!showNewGroup ? (
                                <div className="group-select">
                                    <select
                                        value={selectedGroup}
                                        onChange={(e) => setSelectedGroup(e.target.value)}
                                    >
                                        <option value="">Keine Liste</option>
                                        {groups.map(g => (
                                            <option key={g.id} value={g.id}>{g.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => setShowNewGroup(true)}
                                    >
                                        + Neue Liste
                                    </button>
                                </div>
                            ) : (
                                <div className="group-select">
                                    <input
                                        type="text"
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        placeholder="Name der neuen Liste"
                                    />
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => {
                                            setShowNewGroup(false);
                                            setNewGroupName("");
                                        }}
                                    >
                                        Abbrechen
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Priorität</label>
                            <div className="priority-selector">
                                <button
                                    type="button"
                                    className={`priority-btn low ${priority === 'Low' ? 'active' : ''}`}
                                    onClick={() => setPriority('Low')}
                                >
                                    <span className="priority-dot"></span> Niedrig
                                </button>
                                <button
                                    type="button"
                                    className={`priority-btn medium ${priority === 'Medium' ? 'active' : ''}`}
                                    onClick={() => setPriority('Medium')}
                                >
                                    <span className="priority-dot"></span> Mittel
                                </button>
                                <button
                                    type="button"
                                    className={`priority-btn high ${priority === 'High' ? 'active' : ''}`}
                                    onClick={() => setPriority('High')}
                                >
                                    <span className="priority-dot"></span> Hoch
                                </button>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Geplant am</label>
                                <input
                                    type="datetime-local"
                                    value={plannedDate}
                                    onChange={(e) => setPlannedDate(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Frist</label>
                                <input
                                    type="datetime-local"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? "Wird erstellt..." : "Task erstellen"}
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}

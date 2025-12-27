import { useState, useEffect } from "react";
import { getTodos, getGroups, updateTodo, deleteTodo, addTodo, updateGroup, deleteGroup, createGroup } from "../services/api";
import Layout from "../components/Layout";

const COLORS = [
    '#007aff', '#5856d6', '#af52de', '#ff2d55',
    '#ff3b30', '#ff9500', '#ffcc00', '#34c759',
    '#00c7be', '#30b0c7', '#5ac8fa', '#64d2ff'
];

export default function TaskList({ token, username, onLogout }) {
    const [todos, setTodos] = useState([]);
    const [groups, setGroups] = useState([]);
    const [editTask, setEditTask] = useState(null);
    const [editGroup, setEditGroup] = useState(null);
    const [focusedGroup, setFocusedGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCompleted, setShowCompleted] = useState(false);

    const [quickAddText, setQuickAddText] = useState("");
    const [addingTask, setAddingTask] = useState(false);

    const [newListName, setNewListName] = useState("");
    const [creatingList, setCreatingList] = useState(false);
    const [showNewListModal, setShowNewListModal] = useState(false);
    const [listError, setListError] = useState("");

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [todosRes, groupsRes] = await Promise.all([getTodos(token), getGroups(token)]);
            setTodos(todosRes.data || []);
            setGroups(groupsRes.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const getGroupName = (groupId) => {
        if (!groupId) return "Ohne Liste";
        const group = groups.find(g => g.id === groupId);
        return group ? group.name : "Ohne Liste";
    };

    const getGroupColor = (groupId) => {
        if (!groupId) return "#8e8e93";
        const group = groups.find(g => g.id === groupId);
        return group ? group.color : "#8e8e93";
    };

    const handleDeleteTask = async () => {
        if (!editTask || !confirm("Task wirklich löschen?")) return;
        try {
            await deleteTodo(token, editTask.id);
            setTodos(prev => prev.filter(t => t.id !== editTask.id));
            setEditTask(null);
        } catch (err) { console.error(err); }
    };

    const handleSaveTask = async () => {
        if (!editTask) return;
        try {
            await updateTodo(token, editTask.id, {
                text: editTask.text,
                description: editTask.description,
                group_id: editTask.group_id || null,
                planned_date: editTask.planned_date || null,
                due_date: editTask.due_date || null,
                completed: editTask.completed,
                priority: editTask.priority || 'Medium'
            });
            setTodos(prev => prev.map(t => t.id === editTask.id ? { ...editTask } : t));
            setEditTask(null);
        } catch (err) { console.error(err); }
    };

    const handleToggle = async (task) => {
        const updated = { ...task, completed: !task.completed };
        try {
            await updateTodo(token, task.id, { completed: updated.completed });
            setTodos(prev => prev.map(t => t.id === task.id ? updated : t));
        } catch (err) { console.error(err); }
    };

    const handleQuickAdd = async (groupId) => {
        if (!quickAddText.trim()) return;
        setAddingTask(true);
        try {
            const res = await addTodo(token, {
                text: quickAddText.trim(),
                group_id: groupId || null,
                description: "",
                planned_date: null,
                due_date: null
            });
            setTodos(prev => [...prev, res.data]);
            setQuickAddText("");
        } catch (err) { console.error(err); }
        finally { setAddingTask(false); }
    };

    const handleSaveGroup = async () => {
        if (!editGroup) return;
        try {
            await updateGroup(token, editGroup.id, { name: editGroup.name, color: editGroup.color });
            setGroups(prev => prev.map(g => g.id === editGroup.id ? editGroup : g));
            setEditGroup(null);
        } catch (err) { console.error(err); }
    };

    const handleDeleteGroup = async () => {
        if (!editGroup || !confirm("Liste wirklich löschen? Tasks werden nicht gelöscht.")) return;
        try {
            await deleteGroup(token, editGroup.id);
            setGroups(prev => prev.filter(g => g.id !== editGroup.id));
            setTodos(prev => prev.map(t => t.group_id === editGroup.id ? { ...t, group_id: null } : t));
            setEditGroup(null);
            if (focusedGroup === editGroup.id) setFocusedGroup(null);
        } catch (err) { console.error(err); }
    };

    const activeTodos = todos.filter(t => !t.completed);
    const completedTodos = todos.filter(t => t.completed);
    const columns = [
        ...groups.map(g => ({ ...g, tasks: activeTodos.filter(t => t.group_id === g.id) })),
        { id: null, name: "Ohne Liste", color: "#8e8e93", tasks: activeTodos.filter(t => !t.group_id) }
    ];

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
    };

    const formatDateTimeLocal = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toISOString().slice(0, 16);
    };

    if (loading) {
        return (
            <Layout activePage="lists" onLogout={onLogout} username={username}>
                <div className="loading-screen"><div className="spinner"></div></div>
            </Layout>
        );
    }

    if (focusedGroup !== null) {
        const isNoList = focusedGroup === 'none';
        const isCompletedView = focusedGroup === 'completed';

        if (isCompletedView) {
            return (
                <Layout activePage="lists" onLogout={onLogout} username={username}>
                    <div className="focused-view">
                        <div className="focused-header" style={{ borderColor: '#34c759' }}>
                            <button className="back-btn" onClick={() => setFocusedGroup(null)}>← Zurück</button>
                            <div className="focused-title-section">
                                <h1 style={{ color: '#34c759' }}>✓ Erledigt</h1>
                                <span className="task-count-badge">{completedTodos.length} Tasks</span>
                            </div>
                        </div>

                        <div className="focused-tasks">
                            {completedTodos.length === 0 ? (
                                <div className="empty-focus"><p>Keine erledigten Aufgaben</p></div>
                            ) : (
                                completedTodos.map(task => (
                                    <div key={task.id} className="focused-task completed-item" onClick={() => setEditTask({ ...task })}>
                                        <button
                                            className="task-checkbox checked"
                                            onClick={(e) => { e.stopPropagation(); handleToggle(task); }}
                                            title="Rückgängig machen"
                                        >✓</button>
                                        <div className="task-info">
                                            <span className="task-name completed-text">{task.text}</span>
                                            <div className="original-list">
                                                <span className="list-indicator" style={{ background: getGroupColor(task.group_id) }}></span>
                                                <span>aus: {getGroupName(task.group_id)}</span>
                                            </div>
                                        </div>
                                        <button
                                            className="undo-btn"
                                            onClick={(e) => { e.stopPropagation(); handleToggle(task); }}
                                            title="Wiederherstellen"
                                        >↩</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {editTask && renderTaskModal()}
                </Layout>
            );
        }

        const group = isNoList
            ? { id: null, name: "Ohne Liste", color: "#8e8e93" }
            : groups.find(g => g.id === focusedGroup);

        if (!group && !isNoList) {
            setFocusedGroup(null);
            return null;
        }

        const groupTasks = isNoList
            ? activeTodos.filter(t => !t.group_id)
            : activeTodos.filter(t => t.group_id === focusedGroup);

        return (
            <Layout activePage="lists" onLogout={onLogout} username={username}>
                <div className="focused-view">
                    <div className="focused-header" style={{ borderColor: group.color }}>
                        <button className="back-btn" onClick={() => setFocusedGroup(null)}>← Zurück</button>
                        <div className="focused-title-section">
                            <h1 style={{ color: group.color }}>{group.name}</h1>
                            <span className="task-count-badge">{groupTasks.length} offen</span>
                        </div>
                        {!isNoList && (
                            <button className="edit-list-header-btn" onClick={() => setEditGroup({ ...group })}>
                                Bearbeiten
                            </button>
                        )}
                    </div>

                    <div className="quick-add-bar">
                        <input
                            type="text"
                            placeholder="Neuen Task hinzufügen..."
                            value={quickAddText}
                            onChange={e => setQuickAddText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleQuickAdd(isNoList ? null : focusedGroup)}
                        />
                        <button
                            onClick={() => handleQuickAdd(isNoList ? null : focusedGroup)}
                            disabled={addingTask || !quickAddText.trim()}
                        >
                            {addingTask ? "..." : "+ Hinzufügen"}
                        </button>
                    </div>

                    <div className="focused-tasks">
                        {groupTasks.length === 0 ? (
                            <div className="empty-focus"><p>Keine Aufgaben in dieser Liste</p></div>
                        ) : (
                            groupTasks.map(task => (
                                <div key={task.id} className="focused-task" onClick={() => setEditTask({ ...task })}>
                                    <button
                                        className="task-checkbox"
                                        onClick={(e) => { e.stopPropagation(); handleToggle(task); }}
                                    />
                                    <div className="task-info">
                                        <span className="task-name">{task.text}</span>
                                        {task.description && <p className="task-desc">{task.description}</p>}
                                        <div className="task-dates">
                                            {task.planned_date && <span className="date planned">{formatDate(task.planned_date)}</span>}
                                            {task.due_date && <span className="date due">{formatDate(task.due_date)}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {editTask && renderTaskModal()}
                {editGroup && renderGroupModal()}
            </Layout>
        );
    }

    function renderTaskModal() {
        return (
            <div className="modal-backdrop" onClick={() => setEditTask(null)}>
                <div className="edit-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Task bearbeiten</h2>
                        <button className="close-btn" onClick={() => setEditTask(null)}>×</button>
                    </div>

                    <div className="modal-body">
                        <div className="form-field">
                            <label>Titel</label>
                            <input type="text" value={editTask.text} onChange={e => setEditTask({ ...editTask, text: e.target.value })} />
                        </div>

                        <div className="form-field">
                            <label>Beschreibung</label>
                            <textarea value={editTask.description || ""} onChange={e => setEditTask({ ...editTask, description: e.target.value })} rows={3} />
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label>Liste</label>
                                <select value={editTask.group_id || ""} onChange={e => setEditTask({ ...editTask, group_id: e.target.value ? parseInt(e.target.value) : null })}>
                                    <option value="">Ohne Liste</option>
                                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Priorität</label>
                                <div className="priority-selector">
                                    <button
                                        type="button"
                                        className={`priority-btn low ${editTask.priority === 'Low' ? 'active' : ''}`}
                                        onClick={() => setEditTask({ ...editTask, priority: 'Low' })}
                                    >
                                        <span className="priority-dot"></span> Niedrig
                                    </button>
                                    <button
                                        type="button"
                                        className={`priority-btn medium ${(!editTask.priority || editTask.priority === 'Medium') ? 'active' : ''}`}
                                        onClick={() => setEditTask({ ...editTask, priority: 'Medium' })}
                                    >
                                        <span className="priority-dot"></span> Mittel
                                    </button>
                                    <button
                                        type="button"
                                        className={`priority-btn high ${editTask.priority === 'High' ? 'active' : ''}`}
                                        onClick={() => setEditTask({ ...editTask, priority: 'High' })}
                                    >
                                        <span className="priority-dot"></span> Hoch
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label>Geplant</label>
                                <input type="datetime-local" value={formatDateTimeLocal(editTask.planned_date)} onChange={e => setEditTask({ ...editTask, planned_date: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                            </div>
                            <div className="form-field">
                                <label>Frist</label>
                                <input type="datetime-local" value={formatDateTimeLocal(editTask.due_date)} onChange={e => setEditTask({ ...editTask, due_date: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button className="btn-delete" onClick={handleDeleteTask}>Löschen</button>
                        <div className="footer-right">
                            <button className="btn-cancel" onClick={() => setEditTask(null)}>Abbrechen</button>
                            <button className="btn-save" onClick={handleSaveTask}>Speichern</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    function renderGroupModal() {
        return (
            <div className="modal-backdrop" onClick={() => setEditGroup(null)}>
                <div className="edit-modal group-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Liste bearbeiten</h2>
                        <button className="close-btn" onClick={() => setEditGroup(null)}>×</button>
                    </div>

                    <div className="modal-body">
                        <div className="form-field">
                            <label>Name</label>
                            <input type="text" value={editGroup.name} onChange={e => setEditGroup({ ...editGroup, name: e.target.value })} />
                        </div>

                        <div className="form-field">
                            <label>Farbe</label>
                            <div className="color-picker">
                                {COLORS.map(c => (
                                    <button key={c} className={`color-option ${editGroup.color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setEditGroup({ ...editGroup, color: c })} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button className="btn-delete" onClick={handleDeleteGroup}>Liste löschen</button>
                        <div className="footer-right">
                            <button className="btn-cancel" onClick={() => setEditGroup(null)}>Abbrechen</button>
                            <button className="btn-save" onClick={handleSaveGroup}>Speichern</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Layout activePage="lists" onLogout={onLogout} username={username}>
            <div className="board-view">
                <div className="board-header">
                    <h1 className="board-title">Meine Aufgaben</h1>
                    <div className="header-actions">
                        <button className="add-list-btn" onClick={() => setShowNewListModal(true)}>
                            + Neue Liste
                        </button>
                    </div>
                </div>

                <div className="board-columns">
                    {columns.map(col => (
                        <div key={col.id || "none"} className="board-column" style={{ '--column-color': col.color || '#007aff' }}>
                            <div className="column-header">
                                <div className="column-title" onDoubleClick={() => setFocusedGroup(col.id === null ? 'none' : col.id)} title="Doppelklick für Fokus-Ansicht">
                                    <span className="color-dot" style={{ background: col.color || '#007aff' }}></span>
                                    <h3>{col.name}</h3>
                                </div>
                                <div className="column-actions">
                                    <span className="task-count">{col.tasks.length}</span>
                                    {col.id !== null && (
                                        <button className="edit-list-btn" onClick={() => setEditGroup({ ...col })}>···</button>
                                    )}
                                </div>
                            </div>

                            <div className="column-tasks">
                                {col.tasks.length === 0 ? (
                                    <div className="empty-column"><p>Keine Aufgaben</p></div>
                                ) : (
                                    col.tasks.map(task => (
                                        <div key={task.id} className="task-card" onClick={() => setEditTask({ ...task })}>
                                            <div className="task-card-header">
                                                <button className="task-checkbox" onClick={(e) => { e.stopPropagation(); handleToggle(task); }} />
                                                <span className="task-card-title">{task.text}</span>
                                            </div>
                                            {task.description && <p className="task-card-desc">{task.description}</p>}
                                            <div className="task-card-footer">
                                                {task.priority && task.priority !== 'Medium' && (
                                                    <span className={`task-badge priority-${task.priority.toLowerCase()}`}>
                                                        {task.priority === 'High' ? '↑ Hoch' : '↓ Niedrig'}
                                                    </span>
                                                )}
                                                {task.planned_date && <span className="task-badge planned">{formatDate(task.planned_date)}</span>}
                                                {task.due_date && <span className="task-badge due">{formatDate(task.due_date)}</span>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {editTask && renderTaskModal()}
            {editGroup && renderGroupModal()}

            {showNewListModal && (
                <div className="modal-backdrop" onClick={() => { setShowNewListModal(false); setListError(""); setNewListName(""); }}>
                    <div className="edit-modal new-list-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Neue Liste erstellen</h2>
                            <button className="close-btn" onClick={() => { setShowNewListModal(false); setListError(""); setNewListName(""); }}>×</button>
                        </div>

                        <div className="modal-body">
                            {listError && <div className="error-msg">{listError}</div>}
                            <div className="form-field">
                                <label>Name der Liste</label>
                                <input
                                    type="text"
                                    value={newListName}
                                    onChange={e => { setNewListName(e.target.value); setListError(""); }}
                                    placeholder="z.B. Arbeit, Privat, Einkaufen..."
                                    autoFocus
                                    onKeyDown={async e => {
                                        if (e.key === 'Enter' && newListName.trim()) {
                                            setCreatingList(true);
                                            setListError("");
                                            try {
                                                const res = await createGroup(token, newListName.trim());
                                                setGroups(prev => [...prev, res.data]);
                                                setNewListName("");
                                                setShowNewListModal(false);
                                            } catch (err) {
                                                setListError(err.response?.data?.msg || "Fehler beim Erstellen");
                                            }
                                            finally { setCreatingList(false); }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <div></div>
                            <div className="footer-right">
                                <button className="btn-cancel" onClick={() => { setShowNewListModal(false); setListError(""); setNewListName(""); }}>Abbrechen</button>
                                <button
                                    className="btn-save"
                                    disabled={creatingList || !newListName.trim()}
                                    onClick={async () => {
                                        if (!newListName.trim()) return;
                                        setCreatingList(true);
                                        setListError("");
                                        try {
                                            const res = await createGroup(token, newListName.trim());
                                            setGroups(prev => [...prev, res.data]);
                                            setNewListName("");
                                            setShowNewListModal(false);
                                        } catch (err) {
                                            setListError(err.response?.data?.msg || "Fehler beim Erstellen");
                                        }
                                        finally { setCreatingList(false); }
                                    }}
                                >
                                    {creatingList ? "..." : "Erstellen"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}

import { useState, useEffect } from "react";
import { getTodos, getGroups, updateTodo } from "../services/api";
import Layout from "../components/Layout";

export default function Statistics({ token, username, onLogout }) {
    const [todos, setTodos] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [showCompleted, setShowCompleted] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [todosRes, groupsRes] = await Promise.all([getTodos(token), getGroups(token)]);
            setTodos(todosRes.data || []);
            setGroups(groupsRes.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleToggle = async (task) => {
        const updated = { ...task, completed: !task.completed };
        try {
            await updateTodo(token, task.id, { completed: updated.completed });
            setTodos(prev => prev.map(t => t.id === task.id ? { ...updated, completed_at: updated.completed ? new Date().toISOString() : null } : t));
        } catch (err) { console.error(err); }
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

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
    };

    const now = new Date();
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const open = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const highPriority = todos.filter(t => t.priority === 'High').length;
    const mediumPriority = todos.filter(t => !t.priority || t.priority === 'Medium').length;
    const lowPriority = todos.filter(t => t.priority === 'Low').length;
    const highPriorityOpen = todos.filter(t => t.priority === 'High' && !t.completed).length;
    const highPriorityCompleted = todos.filter(t => t.priority === 'High' && t.completed).length;

    const withDeadline = todos.filter(t => t.due_date).length;
    const overdue = todos.filter(t => t.due_date && new Date(t.due_date) < now && !t.completed).length;
    const dueToday = todos.filter(t => {
        if (!t.due_date || t.completed) return false;
        const due = new Date(t.due_date);
        return due.toDateString() === now.toDateString();
    }).length;
    const dueThisWeek = todos.filter(t => {
        if (!t.due_date || t.completed) return false;
        const due = new Date(t.due_date);
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() + 7);
        return due > now && due <= weekEnd;
    }).length;

    const withPlanned = todos.filter(t => t.planned_date).length;
    const plannedToday = todos.filter(t => {
        if (!t.planned_date || t.completed) return false;
        const planned = new Date(t.planned_date);
        return planned.toDateString() === now.toDateString();
    }).length;

    const listStats = groups.map(g => ({
        ...g,
        total: todos.filter(t => t.group_id === g.id).length,
        completed: todos.filter(t => t.group_id === g.id && t.completed).length,
        open: todos.filter(t => t.group_id === g.id && !t.completed).length,
        overdue: todos.filter(t => t.group_id === g.id && t.due_date && new Date(t.due_date) < now && !t.completed).length
    }));

    const noListStats = {
        id: null,
        name: "Ohne Liste",
        color: "#8e8e93",
        total: todos.filter(t => !t.group_id).length,
        completed: todos.filter(t => !t.group_id && t.completed).length,
        open: todos.filter(t => !t.group_id && !t.completed).length,
        overdue: todos.filter(t => !t.group_id && t.due_date && new Date(t.due_date) < now && !t.completed).length
    };

    const completedTodos = todos.filter(t => t.completed)
        .sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0));

    const tasksWithTime = completedTodos.filter(t => t.completed_at && t.created_at);
    const avgCompletionDays = tasksWithTime.length > 0
        ? Math.round(tasksWithTime.reduce((sum, t) => {
            const created = new Date(t.created_at);
            const completed = new Date(t.completed_at);
            return sum + (completed - created) / (1000 * 60 * 60 * 24);
        }, 0) / tasksWithTime.length)
        : null;

    if (loading) {
        return (
            <Layout activePage="statistics" onLogout={onLogout} username={username}>
                <div className="loading-screen"><div className="spinner"></div></div>
            </Layout>
        );
    }

    const tabs = [
        { id: "overview", label: "Übersicht" },
        { id: "priority", label: "Prioritäten" },
        { id: "deadlines", label: "Fristen" },
        { id: "lists", label: "Listen" },
        { id: "completed", label: "Erledigt" }
    ];

    return (
        <Layout activePage="statistics" onLogout={onLogout} username={username}>
            <div className="stats-page-v2">
                <div className="stats-header-v2">
                    <h1>Statistik</h1>
                </div>

                <div className="stats-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`stats-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                            {tab.id === "completed" && <span className="tab-count">{completed}</span>}
                        </button>
                    ))}
                </div>

                <div className="stats-content-v2">
                    {activeTab === "overview" && (
                        <div className="stats-tab-content">
                            <div className="metric-cards">
                                <div className="metric-card">
                                    <div className="metric-value">{total}</div>
                                    <div className="metric-label">Aufgaben gesamt</div>
                                </div>
                                <div className="metric-card accent-green">
                                    <div className="metric-value">{completed}</div>
                                    <div className="metric-label">Erledigt</div>
                                </div>
                                <div className="metric-card accent-orange">
                                    <div className="metric-value">{open}</div>
                                    <div className="metric-label">Offen</div>
                                </div>
                                <div className="metric-card accent-blue">
                                    <div className="metric-value">{completionRate}%</div>
                                    <div className="metric-label">Erledigungsquote</div>
                                    <div className="metric-bar">
                                        <div className="metric-bar-fill" style={{ width: `${completionRate}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="stats-summary-grid">
                                <div className="summary-card">
                                    <h3>Heute</h3>
                                    <div className="summary-stats">
                                        <div className="summary-stat">
                                            <span className="summary-num">{plannedToday}</span>
                                            <span className="summary-label">Geplant</span>
                                        </div>
                                        <div className="summary-stat">
                                            <span className="summary-num">{dueToday}</span>
                                            <span className="summary-label">Fällig</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="summary-card">
                                    <h3>Diese Woche</h3>
                                    <div className="summary-stats">
                                        <div className="summary-stat">
                                            <span className="summary-num">{dueThisWeek}</span>
                                            <span className="summary-label">Fällig</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="summary-card">
                                    <h3>Dringend</h3>
                                    <div className="summary-stats">
                                        <div className="summary-stat warning">
                                            <span className="summary-num">{highPriorityOpen}</span>
                                            <span className="summary-label">Hohe Priorität offen</span>
                                        </div>
                                        <div className="summary-stat danger">
                                            <span className="summary-num">{overdue}</span>
                                            <span className="summary-label">Überfällig</span>
                                        </div>
                                    </div>
                                </div>

                                {avgCompletionDays !== null && (
                                    <div className="summary-card">
                                        <h3>Durchschnitt</h3>
                                        <div className="summary-stats">
                                            <div className="summary-stat">
                                                <span className="summary-num">{avgCompletionDays}</span>
                                                <span className="summary-label">Tage bis erledigt</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "priority" && (
                        <div className="stats-tab-content">
                            <div className="priority-overview">
                                <div className="priority-card high">
                                    <div className="priority-header">
                                        <span className="priority-indicator"></span>
                                        <span className="priority-name">Hoch</span>
                                    </div>
                                    <div className="priority-numbers">
                                        <div className="priority-num-item">
                                            <span className="num">{highPriority}</span>
                                            <span className="lbl">Gesamt</span>
                                        </div>
                                        <div className="priority-num-item open">
                                            <span className="num">{highPriorityOpen}</span>
                                            <span className="lbl">Offen</span>
                                        </div>
                                        <div className="priority-num-item done">
                                            <span className="num">{highPriorityCompleted}</span>
                                            <span className="lbl">Erledigt</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="priority-card medium">
                                    <div className="priority-header">
                                        <span className="priority-indicator"></span>
                                        <span className="priority-name">Mittel</span>
                                    </div>
                                    <div className="priority-numbers">
                                        <div className="priority-num-item">
                                            <span className="num">{mediumPriority}</span>
                                            <span className="lbl">Gesamt</span>
                                        </div>
                                        <div className="priority-num-item open">
                                            <span className="num">{todos.filter(t => (!t.priority || t.priority === 'Medium') && !t.completed).length}</span>
                                            <span className="lbl">Offen</span>
                                        </div>
                                        <div className="priority-num-item done">
                                            <span className="num">{todos.filter(t => (!t.priority || t.priority === 'Medium') && t.completed).length}</span>
                                            <span className="lbl">Erledigt</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="priority-card low">
                                    <div className="priority-header">
                                        <span className="priority-indicator"></span>
                                        <span className="priority-name">Niedrig</span>
                                    </div>
                                    <div className="priority-numbers">
                                        <div className="priority-num-item">
                                            <span className="num">{lowPriority}</span>
                                            <span className="lbl">Gesamt</span>
                                        </div>
                                        <div className="priority-num-item open">
                                            <span className="num">{todos.filter(t => t.priority === 'Low' && !t.completed).length}</span>
                                            <span className="lbl">Offen</span>
                                        </div>
                                        <div className="priority-num-item done">
                                            <span className="num">{todos.filter(t => t.priority === 'Low' && t.completed).length}</span>
                                            <span className="lbl">Erledigt</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="priority-bar-chart">
                                <h3>Verteilung</h3>
                                <div className="bar-chart">
                                    {total > 0 && (
                                        <>
                                            {highPriority > 0 && (
                                                <div
                                                    className="chart-bar high"
                                                    style={{ width: `${(highPriority / total) * 100}%` }}
                                                    title={`Hoch: ${highPriority}`}
                                                >
                                                    {Math.round((highPriority / total) * 100)}%
                                                </div>
                                            )}
                                            {mediumPriority > 0 && (
                                                <div
                                                    className="chart-bar medium"
                                                    style={{ width: `${(mediumPriority / total) * 100}%` }}
                                                    title={`Mittel: ${mediumPriority}`}
                                                >
                                                    {Math.round((mediumPriority / total) * 100)}%
                                                </div>
                                            )}
                                            {lowPriority > 0 && (
                                                <div
                                                    className="chart-bar low"
                                                    style={{ width: `${(lowPriority / total) * 100}%` }}
                                                    title={`Niedrig: ${lowPriority}`}
                                                >
                                                    {Math.round((lowPriority / total) * 100)}%
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="chart-legend">
                                    <span className="legend-item"><span className="dot high"></span> Hoch</span>
                                    <span className="legend-item"><span className="dot medium"></span> Mittel</span>
                                    <span className="legend-item"><span className="dot low"></span> Niedrig</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "deadlines" && (
                        <div className="stats-tab-content">
                            <div className="deadline-cards">
                                <div className="deadline-card">
                                    <div className="deadline-number">{withDeadline}</div>
                                    <div className="deadline-label">Mit Frist</div>
                                    <div className="deadline-sub">{total - withDeadline} ohne Frist</div>
                                </div>
                                <div className="deadline-card danger">
                                    <div className="deadline-number">{overdue}</div>
                                    <div className="deadline-label">Überfällig</div>
                                    {overdue > 0 && <div className="deadline-alert">Dringend!</div>}
                                </div>
                                <div className="deadline-card warning">
                                    <div className="deadline-number">{dueToday}</div>
                                    <div className="deadline-label">Heute fällig</div>
                                </div>
                                <div className="deadline-card">
                                    <div className="deadline-number">{dueThisWeek}</div>
                                    <div className="deadline-label">Diese Woche</div>
                                </div>
                            </div>

                            <div className="planned-section">
                                <h3>Geplante Aufgaben</h3>
                                <div className="planned-cards">
                                    <div className="planned-card">
                                        <div className="planned-number">{withPlanned}</div>
                                        <div className="planned-label">Mit Datum</div>
                                    </div>
                                    <div className="planned-card accent">
                                        <div className="planned-number">{plannedToday}</div>
                                        <div className="planned-label">Heute geplant</div>
                                    </div>
                                </div>
                            </div>

                            {overdue > 0 && (
                                <div className="overdue-list">
                                    <h3>Überfällige Aufgaben</h3>
                                    <div className="overdue-items">
                                        {todos.filter(t => t.due_date && new Date(t.due_date) < now && !t.completed).map(task => (
                                            <div key={task.id} className="overdue-item">
                                                <span className="overdue-task-name">{task.text}</span>
                                                <span className="overdue-date">Fällig: {formatDate(task.due_date)}</span>
                                                <span className="overdue-list-name" style={{ color: getGroupColor(task.group_id) }}>
                                                    {getGroupName(task.group_id)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "lists" && (
                        <div className="stats-tab-content">
                            <div className="list-cards-v2">
                                {[...listStats, noListStats].filter(l => l.total > 0).map((list, idx) => (
                                    <div key={idx} className="list-card-v2">
                                        <div className="list-card-header">
                                            <span className="list-color-bar" style={{ background: list.color }}></span>
                                            <span className="list-title">{list.name}</span>
                                        </div>
                                        <div className="list-card-body">
                                            <div className="list-metric">
                                                <span className="list-metric-value">{list.total}</span>
                                                <span className="list-metric-label">Gesamt</span>
                                            </div>
                                            <div className="list-metric success">
                                                <span className="list-metric-value">{list.completed}</span>
                                                <span className="list-metric-label">Erledigt</span>
                                            </div>
                                            <div className="list-metric warning">
                                                <span className="list-metric-value">{list.open}</span>
                                                <span className="list-metric-label">Offen</span>
                                            </div>
                                            {list.overdue > 0 && (
                                                <div className="list-metric danger">
                                                    <span className="list-metric-value">{list.overdue}</span>
                                                    <span className="list-metric-label">Überfällig</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="list-card-progress">
                                            <div
                                                className="list-card-progress-fill"
                                                style={{
                                                    width: `${list.total > 0 ? (list.completed / list.total) * 100 : 0}%`,
                                                    background: list.color
                                                }}
                                            ></div>
                                        </div>
                                        <div className="list-card-rate">
                                            {list.total > 0 ? Math.round((list.completed / list.total) * 100) : 0}% erledigt
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "completed" && (
                        <div className="stats-tab-content">
                            <div className="completed-header-v2">
                                <div className="completed-count">{completedTodos.length} erledigte Aufgaben</div>
                                <button
                                    className="toggle-list-btn"
                                    onClick={() => setShowCompleted(!showCompleted)}
                                >
                                    {showCompleted ? "Liste ausblenden" : "Liste anzeigen"}
                                </button>
                            </div>

                            {showCompleted && (
                                <div className="completed-list-v2">
                                    {completedTodos.length === 0 ? (
                                        <p className="no-tasks-msg">Noch keine erledigten Aufgaben</p>
                                    ) : (
                                        completedTodos.map(task => (
                                            <div key={task.id} className="completed-item-v2">
                                                <button
                                                    className="undo-btn"
                                                    onClick={() => handleToggle(task)}
                                                    title="Wiederherstellen"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                                        <path d="M3 3v5h5" />
                                                    </svg>
                                                </button>
                                                <div className="completed-item-content">
                                                    <span className="completed-item-text">{task.text}</span>
                                                    <div className="completed-item-meta">
                                                        <span
                                                            className="completed-item-list"
                                                            style={{ color: getGroupColor(task.group_id) }}
                                                        >
                                                            {getGroupName(task.group_id)}
                                                        </span>
                                                        {task.completed_at && (
                                                            <span className="completed-item-date">
                                                                {formatDate(task.completed_at)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

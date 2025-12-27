import { useState, useEffect } from "react";
import { getTodos } from "../services/api";
import Layout from "../components/Layout";

export default function Calendar({ token, username, onLogout }) {
    const [todos, setTodos] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("month"); // month, week, day

    useEffect(() => { loadTodos(); }, []);

    const loadTodos = async () => {
        try {
            const res = await getTodos(token);
            setTodos(res.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const days = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    const daysLong = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
    const months = ["Januar", "Februar", "März", "April", "Mai", "Juni",
        "Juli", "August", "September", "Oktober", "November", "Dezember"];

    const getMonthData = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        let startDay = firstDay.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1;

        const cells = [];
        for (let i = 0; i < startDay; i++) cells.push(null);
        for (let i = 1; i <= lastDay.getDate(); i++) {
            cells.push(new Date(year, month, i));
        }
        return cells;
    };

    const getWeekData = () => {
        const startOfWeek = new Date(selectedDate);
        const dayOfWeek = startOfWeek.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startOfWeek.setDate(startOfWeek.getDate() + diff);

        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            weekDays.push(day);
        }
        return weekDays;
    };

    const getEventsForDate = (date) => {
        if (!date) return [];
        const events = [];

        todos.forEach(t => {
            if (t.planned_date) {
                const pd = new Date(t.planned_date);
                if (pd.toDateString() === date.toDateString()) {
                    events.push({ ...t, eventType: 'planned', eventDate: t.planned_date });
                }
            }
            if (t.due_date) {
                const dd = new Date(t.due_date);
                if (dd.toDateString() === date.toDateString()) {
                    events.push({ ...t, eventType: 'due', eventDate: t.due_date });
                }
            }
        });

        return events;
    };

    const isToday = (date) => {
        if (!date) return false;
        return date.toDateString() === new Date().toDateString();
    };

    const isSelected = (date) => {
        if (!date || !selectedDate) return false;
        return date.toDateString() === selectedDate.toDateString();
    };

    const navigate = (direction) => {
        const newDate = new Date(currentDate);
        if (viewMode === "month") {
            newDate.setMonth(newDate.getMonth() + direction);
        } else if (viewMode === "week") {
            newDate.setDate(newDate.getDate() + (direction * 7));
            setSelectedDate(new Date(newDate));
        } else {
            newDate.setDate(newDate.getDate() + direction);
            setSelectedDate(new Date(newDate));
        }
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    };

    const getWeekNumber = (date) => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    };

    if (loading) {
        return (
            <Layout activePage="calendar" onLogout={onLogout} username={username}>
                <div className="loading-screen"><div className="spinner"></div></div>
            </Layout>
        );
    }

    const selectedEvents = getEventsForDate(selectedDate);
    const plannedEvents = selectedEvents.filter(e => e.eventType === 'planned');
    const dueEvents = selectedEvents.filter(e => e.eventType === 'due');

    const getNavigationTitle = () => {
        if (viewMode === "month") {
            return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        } else if (viewMode === "week") {
            const weekDays = getWeekData();
            const start = weekDays[0];
            const end = weekDays[6];
            if (start.getMonth() === end.getMonth()) {
                return `${start.getDate()}–${end.getDate()} ${months[start.getMonth()]}`;
            }
            return `${start.getDate()} ${months[start.getMonth()].substring(0, 3)} – ${end.getDate()} ${months[end.getMonth()].substring(0, 3)}`;
        } else {
            const dayIdx = selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1;
            return `${daysLong[dayIdx]}, ${selectedDate.getDate()}. ${months[selectedDate.getMonth()]}`;
        }
    };

    return (
        <Layout activePage="calendar" onLogout={onLogout} username={username}>
            <div className="calendar-page-v2">
                <div className="calendar-main">
                    <div className="cal-header-v2">
                        <div className="cal-nav-group">
                            <button className="cal-nav-btn" onClick={() => navigate(-1)}>‹</button>
                            <button className="cal-nav-btn" onClick={() => navigate(1)}>›</button>
                            <h2 className="cal-title-v2">{getNavigationTitle()}</h2>
                        </div>
                        <div className="cal-actions">
                            <button className="today-btn" onClick={goToToday}>Heute</button>
                            <div className="view-switcher">
                                <button
                                    className={viewMode === "day" ? "active" : ""}
                                    onClick={() => setViewMode("day")}
                                >Tag</button>
                                <button
                                    className={viewMode === "week" ? "active" : ""}
                                    onClick={() => setViewMode("week")}
                                >Woche</button>
                                <button
                                    className={viewMode === "month" ? "active" : ""}
                                    onClick={() => setViewMode("month")}
                                >Monat</button>
                            </div>
                        </div>
                    </div>

                    {viewMode === "month" && (
                        <div className="month-view">
                            <div className="cal-days-row">
                                {days.map(d => <div key={d} className="cal-day-label">{d}</div>)}
                            </div>
                            <div className="cal-grid-compact">
                                {getMonthData().map((date, idx) => {
                                    const events = date ? getEventsForDate(date) : [];
                                    const hasPlanned = events.some(e => e.eventType === 'planned');
                                    const hasDue = events.some(e => e.eventType === 'due');

                                    return (
                                        <div
                                            key={idx}
                                            className={`cal-cell-compact ${!date ? 'empty' : ''} ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
                                            onClick={() => date && setSelectedDate(date)}
                                        >
                                            {date && (
                                                <>
                                                    <span className="cell-date">{date.getDate()}</span>
                                                    {(hasPlanned || hasDue) && (
                                                        <div className="cell-dots">
                                                            {hasPlanned && <span className="dot planned"></span>}
                                                            {hasDue && <span className="dot due"></span>}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {viewMode === "week" && (
                        <div className="week-view">
                            <div className="week-header">
                                <div className="week-label">KW {getWeekNumber(selectedDate)}</div>
                                {getWeekData().map((date, idx) => (
                                    <div
                                        key={idx}
                                        className={`week-day-header ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
                                        onClick={() => setSelectedDate(date)}
                                    >
                                        <span className="week-day-name">{days[idx]}</span>
                                        <span className="week-day-num">{date.getDate()}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="week-body">
                                <div className="week-time-col">
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <div key={i} className="time-slot">{String(8 + i).padStart(2, '0')}:00</div>
                                    ))}
                                </div>
                                {getWeekData().map((date, dayIdx) => {
                                    const events = getEventsForDate(date);
                                    return (
                                        <div
                                            key={dayIdx}
                                            className={`week-day-col ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
                                            onClick={() => setSelectedDate(date)}
                                        >
                                            {events.slice(0, 3).map((event, i) => (
                                                <div
                                                    key={i}
                                                    className={`week-event ${event.eventType}`}
                                                    title={event.text}
                                                >
                                                    {event.text.substring(0, 15)}{event.text.length > 15 ? '...' : ''}
                                                </div>
                                            ))}
                                            {events.length > 3 && (
                                                <div className="week-more">+{events.length - 3} mehr</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {viewMode === "day" && (
                        <div className="day-view">
                            <div className="day-all-events">
                                {selectedEvents.length === 0 ? (
                                    <div className="no-events-day">
                                        <p>Keine Aufgaben für diesen Tag</p>
                                    </div>
                                ) : (
                                    <div className="day-events-list">
                                        {plannedEvents.length > 0 && (
                                            <div className="day-section">
                                                <h4 className="day-section-title planned">Geplant</h4>
                                                {plannedEvents.map((event, i) => (
                                                    <div key={i} className="day-event-card planned">
                                                        <div className="day-event-time">{formatTime(event.eventDate)}</div>
                                                        <div className="day-event-content">
                                                            <span className="day-event-title">{event.text}</span>
                                                            {event.description && <p className="day-event-desc">{event.description}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {dueEvents.length > 0 && (
                                            <div className="day-section">
                                                <h4 className="day-section-title due">Frist</h4>
                                                {dueEvents.map((event, i) => (
                                                    <div key={i} className="day-event-card due">
                                                        <div className="day-event-time">{formatTime(event.eventDate)}</div>
                                                        <div className="day-event-content">
                                                            <span className="day-event-title">{event.text}</span>
                                                            {event.description && <p className="day-event-desc">{event.description}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {viewMode !== "day" && (
                    <div className="calendar-sidebar">
                        <div className="sidebar-date">
                            <span className="sidebar-day">{selectedDate.getDate()}</span>
                            <span className="sidebar-month">{months[selectedDate.getMonth()]}</span>
                        </div>

                        {selectedEvents.length === 0 ? (
                            <p className="no-tasks-sidebar">Keine Aufgaben</p>
                        ) : (
                            <div className="sidebar-events">
                                {plannedEvents.length > 0 && (
                                    <div className="sidebar-section">
                                        <h5 className="sidebar-section-title"><span className="dot planned"></span>Geplant</h5>
                                        {plannedEvents.map((event, i) => (
                                            <div key={i} className="sidebar-event">
                                                <span className="sidebar-event-title">{event.text}</span>
                                                <span className="sidebar-event-time">{formatTime(event.eventDate)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {dueEvents.length > 0 && (
                                    <div className="sidebar-section">
                                        <h5 className="sidebar-section-title"><span className="dot due"></span>Frist</h5>
                                        {dueEvents.map((event, i) => (
                                            <div key={i} className="sidebar-event due">
                                                <span className="sidebar-event-title">{event.text}</span>
                                                <span className="sidebar-event-time">{formatTime(event.eventDate)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="sidebar-legend">
                            <div className="legend-row"><span className="dot planned"></span>Geplant</div>
                            <div className="legend-row"><span className="dot due"></span>Frist</div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}

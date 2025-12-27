import { useNavigate } from "react-router-dom";

export default function Layout({ children, activePage, onLogout, username }) {
    const navigate = useNavigate();

    return (
        <div className="app-layout">
            <nav className="sidebar">
                <div className="sidebar-header">
                    <h2>TuDu</h2>
                </div>

                <div className="nav-items">
                    <button
                        className={activePage === "create" ? "active" : ""}
                        onClick={() => navigate("/create")}
                    >
                        Neuer Task
                    </button>
                    <button
                        className={activePage === "lists" ? "active" : ""}
                        onClick={() => navigate("/")}
                    >
                        Alle Listen
                    </button>
                    <button
                        className={activePage === "calendar" ? "active" : ""}
                        onClick={() => navigate("/calendar")}
                    >
                        Kalender
                    </button>
                    <button
                        className={activePage === "statistics" ? "active" : ""}
                        onClick={() => navigate("/statistics")}
                    >
                        Statistik
                    </button>
                </div>

                <div className="sidebar-footer">
                    {username && (
                        <div className="user-info">
                            <span className="user-icon">👤</span>
                            <span className="username">{username}</span>
                        </div>
                    )}
                    <button className="logout-btn" onClick={onLogout}>
                        Abmelden
                    </button>
                </div>
            </nav>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}

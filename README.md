# TuDu

🚀 About This Project

This is a web-based To-Do application with user authentication, allowing multiple users to create, manage, and categorize their tasks. The app supports priorities, recurring tasks, due dates, and categories. It is built with:

Frontend: React.js\
Backend: Node.js\
Database: SQLite \
Real-time updates: WebSockets (Socket.io)\
Authentication: JWT (JSON Web Tokens)\
AI Features: Smart task recommendations, automated scheduling, and natural language processing for task creation\


# 📂 Project Structure


TuDu-app/\
│── backend/  
│   ├── models/       # Database models  
│   ├── routes/       # API endpoints  
│   ├── controllers/  # logic  
│   ├── middleware/   # Authentication, logging  
│   ├── utils/        # Reusable helper functions  
│   ├── config/       # Configuration & environment variables  
│   ├── server.js     # Main server  
│── frontend/  
│   ├── components/   # UI components  
│   ├── pages/        # Main pages (Login, Dashboard)  
│   ├── services/     # API calls (Axios)  
│   ├── App.jsx       # Main React app  
│── database.sql      # SQL setup  
│── docker-compose.yml # Deployment  
│── .env              # Environment variables  

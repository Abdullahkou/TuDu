# TuDu

About This Project

This is a web-based To-Do application with user authentication, allowing multiple users to create, manage, and categorize their tasks. The app supports priorities, recurring tasks, due dates, and categories. It is built with:

Frontend: React.js
Backend: Node.js
Database: SQLite 
Real-time updates: WebSockets (Socket.io)
Authentication: JWT (JSON Web Tokens)
AI Features: Smart task recommendations, automated scheduling, and natural language processing for task creation


## Project Structure


TuDu-app/
│── backend/  
│   ├── models/          # Database models  
│   ├── routes/          # API endpoints  
│   ├── controllers/     # logic  
│   ├── middleware/      # Authentication, logging  
│   ├── utils/           # Reusable helper functions  
│   ├── config/          # Configuration & environment variables  
│   ├── server.js        # Main server  
│── frontend/  
│   ├── components/      # UI components  
│   ├── pages/           # Main pages (Login, Dashboard)  
│   ├── services/        # API calls (Axios)  
│   ├── App.jsx          # Main React app  
│── database.sql         # SQL setup  
│── docker-compose.yml   # Deployment  
│── .env                 # Environment variables  

## Getting Started

To run the application, you need to start both the Backend (server) and the Frontend (UI).

### 1. Start the Backend
Open a terminal and run:
```sh
cd backend
npm install  # Install dependencies (only needed once)
node server.js
```
The server will start on `http://localhost:3001`.

### 2. Start the Frontend
Open a **new** terminal window and run:
```sh
cd frontend
npm install  # Install dependencies (only needed once)
npm run dev
```
The frontend will start (usually on `http://localhost:5173`).

### 3. Open in Browser
Click the link shown in the frontend terminal (e.g., `http://localhost:5173`) to use the app!

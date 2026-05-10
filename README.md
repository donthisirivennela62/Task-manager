# Team Task Manager

A full-stack task management application with role-based access control for Admin and Member users.

## Features

- Signup and login with JWT authentication
- Role-based access control (Admin / Member)
- Project creation and team member management
- Task creation, assignment, status updates, and due date tracking
- Dashboard metrics for tasks, projects, and overdue items
- REST API with MongoDB
- Static frontend served by Express

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file with:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/team-task-manager
   JWT_SECRET=your_jwt_secret_here
   PORT=4000
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:4000`

## Deployment

Deploy the app to Railway by connecting the repository and setting the environment variables above.

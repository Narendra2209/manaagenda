# 🚀 ProjectHub — SaaS Project Management System

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

A full-stack, role-based project management platform built with **FastAPI**, **React + TypeScript**, and **MongoDB Atlas**.

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Setup](#-environment-setup)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)

---

## ✨ Features

### 🔐 Authentication
- JWT-based authentication with 24-hour token expiry
- Role-based access control (Admin, Employee, Client)
- Protected routes with automatic redirects

### 👑 Admin Dashboard
- Create and manage employees & clients
- Create and manage services
- Approve/reject service requests (auto-creates projects on approval)
- Assign employees to projects
- Platform-wide analytics and statistics

### 👷 Employee Dashboard
- View assigned projects
- Update project status (Not Started → In Progress → Completed)
- Progress tracking with visual indicators

### 🏢 Client Dashboard
- Browse available services
- Submit service requests
- Track project progress

### 💬 Messaging
- Send messages between users
- View message history

---

## 🛠 Tech Stack

| Layer       | Technology                                          |
| ----------- | --------------------------------------------------- |
| **Backend** | FastAPI, Python 3.12+, Motor (async MongoDB driver) |
| **Frontend**| React 18, TypeScript, Vite                          |
| **Database**| MongoDB Atlas                                       |
| **Auth**    | JWT (python-jose), bcrypt (passlib)                 |
| **HTTP**    | Axios with interceptors                             |
| **Routing** | React Router v6                                     |
| **State**   | React Context API                                   |

---

## 📁 Project Structure

```
project-root/
│
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry point
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic settings
│   │   │   └── security.py         # JWT & password utilities
│   │   ├── db/
│   │   │   └── mongodb.py          # Motor connection manager
│   │   ├── models/                 # MongoDB document serializers
│   │   ├── schemas/                # Pydantic request/response models
│   │   ├── services/               # Business logic layer
│   │   └── routers/                # API route handlers
│   ├── seed_admin.py               # Admin user seeder
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx                # React entry point
│   │   ├── App.tsx                 # Router & protected routes
│   │   ├── context/AuthContext.tsx  # Auth state management
│   │   ├── services/api.ts         # Axios instance
│   │   ├── components/             # Reusable UI components
│   │   └── pages/                  # Page components
│   ├── package.json
│   └── index.html
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **MongoDB Atlas** account (or local MongoDB)
- **Git**

### Clone the Repository

```bash
git clone https://github.com/Narendra2209/manaagenda.git
cd manaagenda
```

---

## ⚙ Environment Setup

### 1. Backend Environment

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env
```

Edit `.env` with your values:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/saas_pm?retryWrites=true&w=majority
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
```

> ⚠️ **Important:** Make sure your MongoDB Atlas cluster has your IP whitelisted under **Network Access**.

### 3. Seed Admin User

```bash
python seed_admin.py
```

This creates the initial admin account:
- **Email:** `admin@example.com`
- **Password:** `admin123`

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

---

## ▶ Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

Backend API will be available at: `http://localhost:8000`  
Swagger docs at: `http://localhost:8000/docs`

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint              | Description     |
| ------ | --------------------- | --------------- |
| POST   | `/api/auth/login`     | User login      |

### Admin (🔒 Admin only)
| Method | Endpoint                                      | Description               |
| ------ | --------------------------------------------- | ------------------------- |
| POST   | `/api/admin/users`                            | Create employee/client    |
| GET    | `/api/admin/users`                            | List all users            |
| GET    | `/api/admin/users/employees`                  | List employees            |
| GET    | `/api/admin/users/clients`                    | List clients              |
| POST   | `/api/admin/services`                         | Create service            |
| GET    | `/api/admin/services`                         | List services             |
| GET    | `/api/admin/service-requests`                 | List service requests     |
| PUT    | `/api/admin/service-requests/:id/approve`     | Approve & create project  |
| PUT    | `/api/admin/service-requests/:id/reject`      | Reject request            |
| GET    | `/api/admin/projects`                         | List all projects         |
| PUT    | `/api/admin/projects/:id/assign`              | Assign employees          |
| GET    | `/api/admin/stats`                            | Dashboard statistics      |

### Employee (🔒 Employee only)
| Method | Endpoint                                 | Description            |
| ------ | ---------------------------------------- | ---------------------- |
| GET    | `/api/employee/projects`                 | View assigned projects |
| PUT    | `/api/employee/projects/:id/status`      | Update project status  |

### Client (🔒 Client only)
| Method | Endpoint                          | Description            |
| ------ | --------------------------------- | ---------------------- |
| GET    | `/api/client/services`            | Browse services        |
| POST   | `/api/client/service-requests`    | Request a service      |
| GET    | `/api/client/service-requests`    | View my requests       |
| GET    | `/api/client/projects`            | View my projects       |

### Messages (🔒 Authenticated)
| Method | Endpoint            | Description         |
| ------ | ------------------- | ------------------- |
| POST   | `/api/messages/`    | Send a message      |
| GET    | `/api/messages/`    | Get my messages     |

---

## 🌐 Deployment

### Backend (Render / Railway / AWS)

1. Set environment variables on your hosting platform
2. Use the start command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
3. Update CORS origins in `app/main.py` to include your frontend URL

### Frontend (Vercel / Netlify)

1. Set the build command: `npm run build`
2. Set the output directory: `dist`
3. Update `src/services/api.ts` with your production API URL

### MongoDB Atlas

1. Whitelist your deployment server's IP (or use `0.0.0.0/0` for all)
2. Use a dedicated database user with limited permissions

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/Narendra2209">Narendra</a></p>
</div>

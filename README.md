# 🚀 Narendra Tech Solutions — Software Company Management Portal

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

A full-stack, role-based software company management portal built with **FastAPI**, **React + TypeScript**, and **MongoDB Atlas**.

**🌐 Live Demo:** [https://manaagenda-1.onrender.com](https://manaagenda-1.onrender.com)

**🔗 Backend API:** [https://manaagenda-jrkp.onrender.com](https://manaagenda-jrkp.onrender.com)

</div>

---

## 🔐 Test Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@example.com` | `admin123` |
| **Employee** | *(Created via Admin dashboard)* | *(Set during creation)* |
| **Client** | *(Created via Admin dashboard)* | *(Set during creation)* |

> After logging in as Admin, create Employee and Client users from the "Users" tab to test all roles.

---

## ✨ Features

### 🔐 Authentication
- JWT-based authentication with role-based access control
- Protected routes with automatic redirects
- Three roles: Admin, Employee, Client

### 👑 Admin Portal
- Create/remove employees and clients
- Create and manage services
- Approve/reject client service requests (auto-creates projects on approval)
- Assign/unassign employees to projects
- Dashboard with platform-wide statistics
- Messaging with employees and clients
- Edit profile with password change

### 👷 Employee Portal
- View assigned projects
- Update project status (Not Started → In Progress → Completed)
- Message admin and assigned clients
- Edit profile
- **Cannot** unassign themselves from projects

### 🏢 Client Portal
- Browse available services
- Request new services
- View request status and track projects
- Message admin and assigned employees
- Edit profile

### 💬 Messaging System
- Admin ↔ Employee messaging
- Admin ↔ Client messaging
- Client ↔ Assigned Employee messaging
- Role-based contact filtering

### 📊 Service Request Flow
```
Client requests service → Admin approves → Project auto-created → Admin assigns employees
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI, Python 3.11, Motor (async MongoDB driver) |
| **Frontend** | React 18, TypeScript, Vite |
| **Database** | MongoDB Atlas |
| **Authentication** | JWT (python-jose), bcrypt (passlib) |
| **HTTP Client** | Axios with interceptors |
| **Routing** | React Router v6 |
| **State Management** | React Context API |
| **Deployment** | Render (Backend + Frontend) |

---

## 📁 Project Structure

```
project-root/
│
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry point
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic settings management
│   │   │   └── security.py         # JWT auth, password hashing, role guards
│   │   ├── db/
│   │   │   └── mongodb.py          # Motor async connection manager
│   │   ├── models/                 # MongoDB document serializers
│   │   │   ├── user_model.py
│   │   │   ├── service_model.py
│   │   │   ├── project_model.py
│   │   │   └── message_model.py
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   │   ├── user_schema.py
│   │   │   ├── service_schema.py
│   │   │   ├── project_schema.py
│   │   │   └── message_schema.py
│   │   ├── services/               # Business logic layer
│   │   │   ├── auth_service.py
│   │   │   ├── user_service.py
│   │   │   ├── project_service.py
│   │   │   └── message_service.py
│   │   └── routers/                # API route handlers
│   │       ├── auth.py             # Login + profile management
│   │       ├── admin.py            # Admin CRUD + dashboard
│   │       ├── employee.py         # Employee projects + status
│   │       ├── client.py           # Client services + requests
│   │       └── messages.py         # Messaging + contacts
│   ├── main.py                     # Root entry point for deployment
│   ├── seed_admin.py               # Admin user seeder
│   ├── requirements.txt
│   ├── .env.example
│   └── .python-version
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx                # React entry point
│   │   ├── App.tsx                 # Router configuration
│   │   ├── index.css               # Complete design system
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # Auth state management
│   │   ├── services/
│   │   │   └── api.ts              # Axios instance with JWT
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   └── pages/
│   │       ├── Login.tsx
│   │       ├── AdminDashboard.tsx
│   │       ├── EmployeeDashboard.tsx
│   │       └── ClientDashboard.tsx
│   ├── package.json
│   └── index.html
│
├── render.yaml                     # Render deployment blueprint
├── .gitignore
└── README.md
```

---

## 🗄 Database Design

### Collections

| Collection | Description | Key Fields |
|-----------|-------------|------------|
| `users` | All users (admin, employees, clients) | name, email, password (hashed), role |
| `services` | Available services | name, description, created_at |
| `service_requests` | Client service requests | service_id, client_id, status, message |
| `projects` | Active projects | name, description, client_id, assigned_employees, status, created_at |
| `messages` | User messages | sender_id, receiver_id, content, created_at |

### Indexes
- `users.email` — unique index for fast lookups and duplicate prevention

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **MongoDB Atlas** account (or local MongoDB)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/Narendra2209/manaagenda.git
cd manaagenda
```

### 2. Backend Setup

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

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your MongoDB Atlas connection string:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/saas_pm?retryWrites=true&w=majority
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
```

> ⚠️ Make sure your MongoDB Atlas cluster has your IP whitelisted under **Network Access**.

### 4. Seed Admin User

```bash
python seed_admin.py
```

Creates: `admin@example.com` / `admin123`

### 5. Frontend Setup

```bash
cd ../frontend
npm install
```

### 6. Run the Application

**Terminal 1 — Backend:**
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:8000](http://localhost:8000)
- Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile + password |

### Admin (🔒 Admin only)
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/admin/users` | Create employee/client |
| GET | `/api/admin/users` | List all users |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/users/employees` | List employees |
| GET | `/api/admin/users/clients` | List clients |
| POST | `/api/admin/services` | Create service |
| GET | `/api/admin/services` | List services |
| GET | `/api/admin/service-requests` | List service requests |
| PUT | `/api/admin/service-requests/:id/approve` | Approve & create project |
| PUT | `/api/admin/service-requests/:id/reject` | Reject request |
| GET | `/api/admin/projects` | List all projects |
| PUT | `/api/admin/projects/:id/assign` | Assign employees |
| PUT | `/api/admin/projects/:id/unassign` | Unassign employee |
| GET | `/api/admin/stats` | Dashboard statistics |

### Employee (🔒 Employee only)
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/employee/projects` | View assigned projects |
| PUT | `/api/employee/projects/:id/status` | Update project status |

### Client (🔒 Client only)
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/client/services` | Browse services |
| POST | `/api/client/service-requests` | Request a service |
| GET | `/api/client/service-requests` | View my requests |
| GET | `/api/client/projects` | View my projects |

### Messages (🔒 Authenticated)
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/messages/` | Send a message |
| GET | `/api/messages/` | Get my messages |
| GET | `/api/messages/contacts` | Get available contacts |

---

## 🌐 Deployment

The application is deployed on **Render**:

- **Frontend:** Static site with `npm run build` → `dist/`
- **Backend:** Web service with `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Environment Variables (Render)

**Backend:**
| Key | Description |
|-----|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `SECRET_KEY` | JWT secret key |
| `ALGORITHM` | `HS256` |

**Frontend:**
| Key | Description |
|-----|-------------|
| `VITE_API_URL` | Backend API URL (e.g., `https://manaagenda-jrkp.onrender.com/api`) |

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/Narendra2209">Narendra</a></p>
</div>

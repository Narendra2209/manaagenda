import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

interface Stats {
    total_users: number;
    total_employees: number;
    total_clients: number;
    total_projects: number;
    total_services: number;
    pending_requests: number;
    active_projects: number;
    completed_projects: number;
}

interface ServiceRequest {
    id: string;
    client_id: string;
    service_id: string;
    status: string;
    created_at: string;
}

interface Project {
    id: string;
    name: string;
    description: string;
    client_id: string;
    service_request_id: string;
    employee_ids: string[];
    status: string;
    created_at: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState<Stats | null>(null);
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [employees, setEmployees] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState('');

    // Create user form
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE' });
    // Create service form
    const [newService, setNewService] = useState({ name: '', description: '' });
    // Assign employee
    const [assignProjectId, setAssignProjectId] = useState('');
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, reqRes, projRes, empRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/service-requests'),
                api.get('/admin/projects'),
                api.get('/admin/users/employees'),
            ]);
            setStats(statsRes.data);
            setRequests(reqRes.data);
            setProjects(projRes.data);
            setEmployees(empRes.data);
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const showFeedback = (type: string, message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading('create-user');
        try {
            await api.post('/admin/users', newUser);
            setNewUser({ name: '', email: '', password: '', role: 'EMPLOYEE' });
            showFeedback('success', 'User created successfully!');
            fetchData();
        } catch (err: any) {
            showFeedback('error', err.response?.data?.detail || 'Failed to create user');
        } finally {
            setActionLoading('');
        }
    };

    const handleCreateService = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading('create-service');
        try {
            await api.post('/admin/services', newService);
            setNewService({ name: '', description: '' });
            showFeedback('success', 'Service created successfully!');
            fetchData();
        } catch (err: any) {
            showFeedback('error', err.response?.data?.detail || 'Failed to create service');
        } finally {
            setActionLoading('');
        }
    };

    const handleApprove = async (requestId: string) => {
        setActionLoading(`approve-${requestId}`);
        try {
            await api.put(`/admin/service-requests/${requestId}/approve`);
            showFeedback('success', 'Request approved & project created!');
            fetchData();
        } catch (err: any) {
            showFeedback('error', err.response?.data?.detail || 'Failed to approve');
        } finally {
            setActionLoading('');
        }
    };

    const handleReject = async (requestId: string) => {
        setActionLoading(`reject-${requestId}`);
        try {
            await api.put(`/admin/service-requests/${requestId}/reject`);
            showFeedback('success', 'Request rejected.');
            fetchData();
        } catch (err: any) {
            showFeedback('error', err.response?.data?.detail || 'Failed to reject');
        } finally {
            setActionLoading('');
        }
    };

    const handleAssignEmployees = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignProjectId || selectedEmployees.length === 0) return;
        setActionLoading('assign');
        try {
            await api.put(`/admin/projects/${assignProjectId}/assign`, {
                employee_ids: selectedEmployees,
            });
            showFeedback('success', 'Employees assigned!');
            setSelectedEmployees([]);
            setAssignProjectId('');
            fetchData();
        } catch (err: any) {
            showFeedback('error', err.response?.data?.detail || 'Failed to assign');
        } finally {
            setActionLoading('');
        }
    };

    const toggleEmployee = (id: string) => {
        setSelectedEmployees((prev) =>
            prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
        );
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'PENDING': return 'status-pending';
            case 'APPROVED': return 'status-approved';
            case 'REJECTED': return 'status-rejected';
            case 'NOT_STARTED': return 'status-not-started';
            case 'IN_PROGRESS': return 'status-in-progress';
            case 'COMPLETED': return 'status-completed';
            default: return '';
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="page-loader">
                    <div className="spinner"></div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="dashboard">
                {feedback.message && (
                    <div className={`alert alert-${feedback.type} alert-floating`}>
                        {feedback.message}
                    </div>
                )}

                <div className="dashboard-header">
                    <h1>Admin Dashboard</h1>
                    <p className="dashboard-subtitle">Manage your platform from one place</p>
                </div>

                {/* Tab Navigation */}
                <div className="tabs">
                    {['overview', 'users', 'services', 'requests', 'projects'].map((tab) => (
                        <button
                            key={tab}
                            className={`tab ${activeTab === tab ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                            id={`tab-${tab}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && stats && (
                    <div className="stats-grid">
                        <div className="stat-card stat-purple">
                            <div className="stat-icon">👥</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.total_users}</div>
                                <div className="stat-label">Total Users</div>
                            </div>
                        </div>
                        <div className="stat-card stat-blue">
                            <div className="stat-icon">👷</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.total_employees}</div>
                                <div className="stat-label">Employees</div>
                            </div>
                        </div>
                        <div className="stat-card stat-green">
                            <div className="stat-icon">🏢</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.total_clients}</div>
                                <div className="stat-label">Clients</div>
                            </div>
                        </div>
                        <div className="stat-card stat-orange">
                            <div className="stat-icon">📁</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.total_projects}</div>
                                <div className="stat-label">Projects</div>
                            </div>
                        </div>
                        <div className="stat-card stat-pink">
                            <div className="stat-icon">⚡</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.total_services}</div>
                                <div className="stat-label">Services</div>
                            </div>
                        </div>
                        <div className="stat-card stat-yellow">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.pending_requests}</div>
                                <div className="stat-label">Pending Requests</div>
                            </div>
                        </div>
                        <div className="stat-card stat-teal">
                            <div className="stat-icon">🚀</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.active_projects}</div>
                                <div className="stat-label">Active Projects</div>
                            </div>
                        </div>
                        <div className="stat-card stat-emerald">
                            <div className="stat-icon">✅</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.completed_projects}</div>
                                <div className="stat-label">Completed</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="tab-content">
                        <div className="card">
                            <h3 className="card-title">Create New User</h3>
                            <form onSubmit={handleCreateUser} className="form-row">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    required
                                    id="create-user-name"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                    id="create-user-email"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                    id="create-user-password"
                                />
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    id="create-user-role"
                                >
                                    <option value="EMPLOYEE">Employee</option>
                                    <option value="CLIENT">Client</option>
                                </select>
                                <button type="submit" className="btn btn-primary" id="create-user-btn" disabled={actionLoading === 'create-user'}>
                                    {actionLoading === 'create-user' ? '...' : 'Create'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Services Tab */}
                {activeTab === 'services' && (
                    <div className="tab-content">
                        <div className="card">
                            <h3 className="card-title">Create Service</h3>
                            <form onSubmit={handleCreateService} className="form-row">
                                <input
                                    type="text"
                                    placeholder="Service Name"
                                    value={newService.name}
                                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                    required
                                    id="create-service-name"
                                />
                                <input
                                    type="text"
                                    placeholder="Description"
                                    value={newService.description}
                                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                    required
                                    id="create-service-description"
                                />
                                <button type="submit" className="btn btn-primary" id="create-service-btn" disabled={actionLoading === 'create-service'}>
                                    {actionLoading === 'create-service' ? '...' : 'Create'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Requests Tab */}
                {activeTab === 'requests' && (
                    <div className="tab-content">
                        <div className="card">
                            <h3 className="card-title">Service Requests</h3>
                            {requests.length === 0 ? (
                                <p className="empty-state">No service requests yet.</p>
                            ) : (
                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Client</th>
                                                <th>Service</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {requests.map((req) => (
                                                <tr key={req.id}>
                                                    <td className="mono">{req.id.slice(-6)}</td>
                                                    <td className="mono">{req.client_id.slice(-6)}</td>
                                                    <td className="mono">{req.service_id.slice(-6)}</td>
                                                    <td>
                                                        <span className={`status-badge ${getStatusClass(req.status)}`}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {req.status === 'PENDING' && (
                                                            <div className="btn-group">
                                                                <button
                                                                    className="btn btn-success btn-sm"
                                                                    onClick={() => handleApprove(req.id)}
                                                                    disabled={actionLoading === `approve-${req.id}`}
                                                                    id={`approve-${req.id}`}
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-sm"
                                                                    onClick={() => handleReject(req.id)}
                                                                    disabled={actionLoading === `reject-${req.id}`}
                                                                    id={`reject-${req.id}`}
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Projects Tab */}
                {activeTab === 'projects' && (
                    <div className="tab-content">
                        <div className="card">
                            <h3 className="card-title">Assign Employees to Project</h3>
                            <form onSubmit={handleAssignEmployees} className="form-row">
                                <select
                                    value={assignProjectId}
                                    onChange={(e) => setAssignProjectId(e.target.value)}
                                    required
                                    id="assign-project-select"
                                >
                                    <option value="">Select Project</option>
                                    {projects.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="checkbox-group">
                                    {employees.map((emp) => (
                                        <label key={emp.id} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={selectedEmployees.includes(emp.id)}
                                                onChange={() => toggleEmployee(emp.id)}
                                            />
                                            {emp.name}
                                        </label>
                                    ))}
                                </div>
                                <button type="submit" className="btn btn-primary" id="assign-employees-btn" disabled={actionLoading === 'assign'}>
                                    {actionLoading === 'assign' ? '...' : 'Assign'}
                                </button>
                            </form>
                        </div>

                        <div className="card mt-lg">
                            <h3 className="card-title">All Projects</h3>
                            {projects.length === 0 ? (
                                <p className="empty-state">No projects yet.</p>
                            ) : (
                                <div className="project-grid">
                                    {projects.map((p) => (
                                        <div className="project-card" key={p.id}>
                                            <div className="project-card-header">
                                                <h4>{p.name}</h4>
                                                <span className={`status-badge ${getStatusClass(p.status)}`}>
                                                    {p.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="project-desc">{p.description}</p>
                                            <div className="project-meta">
                                                <span>👤 Client: {p.client_id.slice(-6)}</span>
                                                <span>👷 Employees: {p.employee_ids.length}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminDashboard;

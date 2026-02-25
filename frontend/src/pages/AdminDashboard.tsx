import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

interface User { id: string; name: string; email: string; role: string; }
interface Service { id: string; name: string; description: string; }
interface ServiceRequest { id: string; service_id: string; client_id: string; client_name: string; service_name: string; status: string; message: string; created_at: string; }
interface Project { id: string; name: string; description: string; client_id: string; client_name: string; assigned_employees: string[]; status: string; created_at: string; }
interface Message { id: string; sender_id: string; sender_name: string; receiver_id: string; receiver_name: string; content: string; created_at: string; }
interface Contact { id: string; name: string; email: string; role: string; }

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState<any>({});
    const [users, setUsers] = useState<User[]>([]);
    const [employees, setEmployees] = useState<User[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ type: '', message: '' });

    // Form states
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE' });
    const [newService, setNewService] = useState({ name: '', description: '' });
    const [msgReceiver, setMsgReceiver] = useState('');
    const [msgContent, setMsgContent] = useState('');

    // Profile states
    const [profile, setProfile] = useState({ name: '', email: '' });
    const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '' });

    const showAlert = (type: string, message: string) => {
        setAlert({ type, message });
        setTimeout(() => setAlert({ type: '', message: '' }), 3000);
    };

    useEffect(() => {
        if (activeTab === 'overview') fetchStats();
        if (activeTab === 'users') { fetchUsers(); fetchEmployees(); }
        if (activeTab === 'services') fetchServices();
        if (activeTab === 'requests') fetchRequests();
        if (activeTab === 'projects') { fetchProjects(); fetchEmployees(); }
        if (activeTab === 'messages') { fetchMessages(); fetchContacts(); }
        if (activeTab === 'profile') fetchProfile();
    }, [activeTab]);

    const fetchStats = async () => { try { const r = await api.get('/admin/stats'); setStats(r.data); } catch { } };
    const fetchUsers = async () => { try { const r = await api.get('/admin/users'); setUsers(r.data); } catch { } };
    const fetchEmployees = async () => { try { const r = await api.get('/admin/users/employees'); setEmployees(r.data); } catch { } };
    const fetchServices = async () => { try { const r = await api.get('/admin/services'); setServices(r.data); } catch { } };
    const fetchRequests = async () => { try { const r = await api.get('/admin/service-requests'); setServiceRequests(r.data); } catch { } };
    const fetchProjects = async () => { try { const r = await api.get('/admin/projects'); setProjects(r.data); } catch { } };
    const fetchMessages = async () => { try { const r = await api.get('/messages/'); setMessages(r.data); } catch { } };
    const fetchContacts = async () => { try { const r = await api.get('/messages/contacts'); setContacts(r.data); } catch { } };
    const fetchProfile = async () => { try { const r = await api.get('/auth/profile'); setProfile({ name: r.data.name, email: r.data.email }); } catch { } };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/admin/users', newUser);
            showAlert('success', `${newUser.role} created successfully!`);
            setNewUser({ name: '', email: '', password: '', role: 'EMPLOYEE' });
            fetchUsers();
        } catch (err: any) { showAlert('error', err.response?.data?.detail || 'Failed'); }
        setLoading(false);
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            showAlert('success', 'User deleted');
            fetchUsers();
        } catch (err: any) { showAlert('error', err.response?.data?.detail || 'Failed'); }
    };

    const handleCreateService = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/admin/services', newService);
            showAlert('success', 'Service created!');
            setNewService({ name: '', description: '' });
            fetchServices();
        } catch (err: any) { showAlert('error', err.response?.data?.detail || 'Failed'); }
        setLoading(false);
    };

    const handleApprove = async (id: string) => {
        try { await api.put(`/admin/service-requests/${id}/approve`); showAlert('success', 'Approved & project created!'); fetchRequests(); }
        catch (err: any) { showAlert('error', err.response?.data?.detail || 'Failed'); }
    };

    const handleReject = async (id: string) => {
        try { await api.put(`/admin/service-requests/${id}/reject`); showAlert('success', 'Rejected'); fetchRequests(); }
        catch (err: any) { showAlert('error', err.response?.data?.detail || 'Failed'); }
    };

    const handleAssign = async (projectId: string, employeeId: string) => {
        if (!employeeId) return;
        try {
            const project = projects.find(p => p.id === projectId);
            const currentEmps = project?.assigned_employees ?? [];
            if (currentEmps.includes(employeeId)) { showAlert('error', 'Already assigned'); return; }
            await api.put(`/admin/projects/${projectId}/assign`, { employee_ids: [...currentEmps, employeeId] });
            showAlert('success', 'Employee assigned!');
            fetchProjects();
        } catch (err: any) { showAlert('error', err.response?.data?.detail || 'Failed'); }
    };

    const handleUnassign = async (projectId: string, employeeId: string) => {
        try {
            await api.put(`/admin/projects/${projectId}/unassign`, { employee_id: employeeId });
            showAlert('success', 'Employee unassigned');
            fetchProjects();
        } catch (err: any) { showAlert('error', err.response?.data?.detail || 'Failed'); }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!msgReceiver || !msgContent.trim()) return;
        try {
            await api.post('/messages/', { receiver_id: msgReceiver, content: msgContent });
            showAlert('success', 'Message sent!');
            setMsgContent('');
            fetchMessages();
        } catch (err: any) { showAlert('error', err.response?.data?.detail || 'Failed'); }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data: any = { name: profile.name, email: profile.email };
            if (passwordData.current_password && passwordData.new_password) {
                data.current_password = passwordData.current_password;
                data.new_password = passwordData.new_password;
            }
            await api.put('/auth/profile', data);
            showAlert('success', 'Profile updated!');
            setPasswordData({ current_password: '', new_password: '' });
            localStorage.setItem('user_name', profile.name);
        } catch (err: any) { showAlert('error', err.response?.data?.detail || 'Failed'); }
    };

    const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || id;

    const tabs = [
        { key: 'overview', label: '📊 Overview' },
        { key: 'users', label: '👥 Users' },
        { key: 'services', label: '🛠 Services' },
        { key: 'requests', label: '📋 Requests' },
        { key: 'projects', label: '📁 Projects' },
        { key: 'messages', label: '💬 Messages' },
        { key: 'profile', label: '👤 Profile' },
    ];

    return (
        <div className="dashboard-page">
            <Navbar />
            {alert.message && <div className={`alert alert-${alert.type} alert-floating`}>{alert.message}</div>}
            <div className="dashboard">
                <div className="dashboard-header">
                    <h1>Admin Dashboard</h1>
                    <p className="dashboard-subtitle">Manage your software company</p>
                </div>
                <div className="tabs">
                    {tabs.map(t => (
                        <button key={t.key} className={`tab ${activeTab === t.key ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab(t.key)}>{t.label}</button>
                    ))}
                </div>

                {/* ── Overview ── */}
                {activeTab === 'overview' && (
                    <div className="stats-grid">
                        {[
                            { label: 'Total Users', value: stats.total_users, icon: '👥' },
                            { label: 'Employees', value: stats.total_employees, icon: '👷' },
                            { label: 'Clients', value: stats.total_clients, icon: '🏢' },
                            { label: 'Projects', value: stats.total_projects, icon: '📁' },
                            { label: 'Services', value: stats.total_services, icon: '🛠' },
                            { label: 'Pending Requests', value: stats.pending_requests, icon: '⏳' },
                            { label: 'Active Projects', value: stats.active_projects, icon: '🚀' },
                            { label: 'Completed', value: stats.completed_projects, icon: '✅' },
                        ].map(s => (
                            <div className="stat-card" key={s.label}>
                                <div className="stat-icon">{s.icon}</div>
                                <div className="stat-info">
                                    <div className="stat-value">{s.value ?? '—'}</div>
                                    <div className="stat-label">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Users ── */}
                {activeTab === 'users' && (
                    <div className="tab-content">
                        <div className="card">
                            <h3>Create New User</h3>
                            <form onSubmit={handleCreateUser}>
                                <div className="form-row">
                                    <input placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />
                                    <input type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                                    <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required />
                                    <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                        <option value="EMPLOYEE">Employee</option>
                                        <option value="CLIENT">Client</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-primary mt-lg" disabled={loading}>
                                    {loading ? <span className="spinner-inline"></span> : 'Create User'}
                                </button>
                            </form>
                        </div>
                        <div className="card">
                            <h3>All Users ({users.length})</h3>
                            {users.length === 0 ? <p className="empty-state">No users found</p> : (
                                <div className="table-container">
                                    <table>
                                        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u.id}>
                                                    <td>{u.name}</td>
                                                    <td>{u.email}</td>
                                                    <td><span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span></td>
                                                    <td>
                                                        {u.role !== 'ADMIN' && (
                                                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id, u.name)}>Delete</button>
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

                {/* ── Services ── */}
                {activeTab === 'services' && (
                    <div className="tab-content">
                        <div className="card">
                            <h3>Create Service</h3>
                            <form onSubmit={handleCreateService}>
                                <div className="form-group">
                                    <input placeholder="Service Name" value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <textarea placeholder="Description" value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })} rows={3} required />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? <span className="spinner-inline"></span> : 'Create Service'}
                                </button>
                            </form>
                        </div>
                        <div className="card">
                            <h3>All Services ({services.length})</h3>
                            {services.length === 0 ? <p className="empty-state">No services yet</p> : (
                                <div className="service-grid">
                                    {services.map(s => (
                                        <div className="service-card" key={s.id}>
                                            <div className="service-icon">🛠</div>
                                            <h4>{s.name}</h4>
                                            <p>{s.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Requests ── */}
                {activeTab === 'requests' && (
                    <div className="tab-content">
                        <div className="card">
                            <h3>Service Requests</h3>
                            {serviceRequests.length === 0 ? <p className="empty-state">No service requests</p> : (
                                <div className="table-container">
                                    <table>
                                        <thead><tr><th>Client</th><th>Service</th><th>Message</th><th>Status</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {serviceRequests.map(r => (
                                                <tr key={r.id}>
                                                    <td>{r.client_name}</td>
                                                    <td>{r.service_name}</td>
                                                    <td>{r.message}</td>
                                                    <td><span className={`badge badge-${r.status.toLowerCase()}`}>{r.status}</span></td>
                                                    <td>
                                                        {r.status === 'PENDING' && (
                                                            <>
                                                                <button className="btn btn-success btn-sm" onClick={() => handleApprove(r.id)}>Approve</button>{' '}
                                                                <button className="btn btn-danger btn-sm" onClick={() => handleReject(r.id)}>Reject</button>
                                                            </>
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

                {/* ── Projects ── */}
                {activeTab === 'projects' && (
                    <div className="tab-content">
                        <div className="card">
                            <h3>All Projects ({projects.length})</h3>
                            {projects.length === 0 ? (
                                <div className="empty-state-container">
                                    <div className="empty-state-icon">📁</div>
                                    <h3>No projects yet</h3>
                                    <p>Projects are auto-created when you approve service requests</p>
                                </div>
                            ) : (
                                <div className="project-grid">
                                    {projects.map(p => (
                                        <div className="project-card" key={p.id}>
                                            <div className="project-header">
                                                <h4>{p.name}</h4>
                                                <span className={`badge badge-${p.status.toLowerCase().replace('_', '-')}`}>{p.status.replace('_', ' ')}</span>
                                            </div>
                                            <p className="project-desc">{p.description}</p>
                                            <p className="project-meta"><strong>Client:</strong> {p.client_name}</p>
                                            <p className="project-meta"><strong>Created:</strong> {new Date(p.created_at).toLocaleDateString()}</p>
                                            <div className="project-employees">
                                                <strong>Assigned:</strong>
                                                {(p.assigned_employees || []).length === 0 ? <span className="text-muted"> None</span> : (
                                                    <div className="employee-chips">
                                                        {(p.assigned_employees || []).map(eid => (
                                                            <span key={eid} className="chip">
                                                                {getEmployeeName(eid)}
                                                                <button className="chip-remove" onClick={() => handleUnassign(p.id, eid)} title="Unassign">×</button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="project-actions">
                                                <select className="status-select" defaultValue="" onChange={e => handleAssign(p.id, e.target.value)}>
                                                    <option value="" disabled>+ Assign Employee</option>
                                                    {employees.filter(emp => !(p.assigned_employees || []).includes(emp.id)).map(emp => (
                                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Messages ── */}
                {activeTab === 'messages' && (
                    <div className="tab-content">
                        <div className="card">
                            <h3>Send Message</h3>
                            <form onSubmit={handleSendMessage}>
                                <div className="form-group">
                                    <label>To</label>
                                    <select value={msgReceiver} onChange={e => setMsgReceiver(e.target.value)} required>
                                        <option value="">Select recipient</option>
                                        {contacts.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Message</label>
                                    <textarea value={msgContent} onChange={e => setMsgContent(e.target.value)} placeholder="Type your message..." rows={3} required />
                                </div>
                                <button type="submit" className="btn btn-primary">Send Message</button>
                            </form>
                        </div>
                        <div className="card">
                            <h3>Message History</h3>
                            {messages.length === 0 ? <p className="empty-state">No messages yet</p> : (
                                <div className="message-list">
                                    {messages.map(m => (
                                        <div key={m.id} className={`message-item ${m.sender_id === localStorage.getItem('user_id') ? 'sent' : 'received'}`}>
                                            <div className="message-header">
                                                <strong>{m.sender_name}</strong> → <strong>{m.receiver_name}</strong>
                                                <span className="message-time">{new Date(m.created_at).toLocaleString()}</span>
                                            </div>
                                            <p className="message-body">{m.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Profile ── */}
                {activeTab === 'profile' && (
                    <div className="tab-content">
                        <div className="card">
                            <h3>Edit Profile</h3>
                            <form onSubmit={handleUpdateProfile}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} required />
                                </div>
                                <h4 style={{ marginTop: '1.5rem' }}>Change Password (optional)</h4>
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input type="password" value={passwordData.current_password} onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input type="password" value={passwordData.new_password} onChange={e => setPasswordData({ ...passwordData, new_password: e.target.value })} />
                                </div>
                                <button type="submit" className="btn btn-primary mt-lg">Save Changes</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

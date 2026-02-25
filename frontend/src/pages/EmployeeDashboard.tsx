import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

interface Project { id: string; name: string; description: string; client_name: string; assigned_employees: string[]; status: string; created_at: string; }
interface Message { id: string; sender_id: string; sender_name: string; receiver_id: string; receiver_name: string; content: string; created_at: string; }
interface Contact { id: string; name: string; email: string; role: string; }

const EmployeeDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('projects');
    const [projects, setProjects] = useState<Project[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ type: '', message: '' });

    const [msgReceiver, setMsgReceiver] = useState('');
    const [msgContent, setMsgContent] = useState('');
    const [profile, setProfile] = useState({ name: '', email: '' });
    const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '' });

    const showAlert = (type: string, message: string) => {
        setAlert({ type, message });
        setTimeout(() => setAlert({ type: '', message: '' }), 3000);
    };

    useEffect(() => {
        if (activeTab === 'projects') fetchProjects();
        if (activeTab === 'messages') { fetchMessages(); fetchContacts(); }
        if (activeTab === 'profile') fetchProfile();
    }, [activeTab]);

    const fetchProjects = async () => {
        setLoading(true);
        try { const r = await api.get('/employee/projects'); setProjects(r.data); } catch { }
        setLoading(false);
    };
    const fetchMessages = async () => { try { const r = await api.get('/messages/'); setMessages(r.data); } catch { } };
    const fetchContacts = async () => { try { const r = await api.get('/messages/contacts'); setContacts(r.data); } catch { } };
    const fetchProfile = async () => { try { const r = await api.get('/auth/profile'); setProfile({ name: r.data.name, email: r.data.email }); } catch { } };

    const handleStatusUpdate = async (projectId: string, newStatus: string) => {
        try {
            await api.put(`/employee/projects/${projectId}/status`, { status: newStatus });
            showAlert('success', 'Status updated!');
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

    const getStatusProgress = (status: string) => {
        switch (status) {
            case 'NOT_STARTED': return 0;
            case 'IN_PROGRESS': return 50;
            case 'COMPLETED': return 100;
            default: return 0;
        }
    };

    const tabs = [
        { key: 'projects', label: '📁 My Projects' },
        { key: 'messages', label: '💬 Messages' },
        { key: 'profile', label: '👤 Profile' },
    ];

    return (
        <div className="dashboard-page">
            <Navbar />
            {alert.message && <div className={`alert alert-${alert.type} alert-floating`}>{alert.message}</div>}
            <div className="dashboard">
                <div className="dashboard-header">
                    <h1>Employee Dashboard</h1>
                    <p className="dashboard-subtitle">Your assigned work and communications</p>
                </div>
                <div className="tabs">
                    {tabs.map(t => (
                        <button key={t.key} className={`tab ${activeTab === t.key ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab(t.key)}>{t.label}</button>
                    ))}
                </div>

                {/* ── Projects ── */}
                {activeTab === 'projects' && (
                    <div className="tab-content">
                        {loading ? (
                            <div className="page-loader"><div className="spinner"></div></div>
                        ) : projects.length === 0 ? (
                            <div className="empty-state-container">
                                <div className="empty-state-icon">📁</div>
                                <h3>No projects assigned</h3>
                                <p>When admin assigns projects to you, they will appear here</p>
                            </div>
                        ) : (
                            <div className="project-grid">
                                {projects.map(p => (
                                    <div className="project-card" key={p.id}>
                                        <div className="project-header">
                                            <h4>{p.name}</h4>
                                            <span className={`badge badge-${p.status.toLowerCase().replace('_', '-')}`}>{p.status.replace('_', ' ')}</span>
                                        </div>
                                        <div className="progress-bar-container">
                                            <div className="progress-bar" style={{ width: `${getStatusProgress(p.status)}%` }}></div>
                                        </div>
                                        <p className="project-desc">{p.description}</p>
                                        <p className="project-meta"><strong>Client:</strong> {p.client_name}</p>
                                        <p className="project-meta"><strong>Created:</strong> {new Date(p.created_at).toLocaleDateString()}</p>
                                        <div className="project-actions">
                                            <label>Update Status:</label>
                                            <select className="status-select" value={p.status} onChange={e => handleStatusUpdate(p.id, e.target.value)}>
                                                <option value="NOT_STARTED">Not Started</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="COMPLETED">Completed</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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

export default EmployeeDashboard;

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

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

const EmployeeDashboard: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState('');
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await api.get('/employee/projects');
            setProjects(res.data);
        } catch (err) {
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const showFeedback = (type: string, message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    };

    const handleStatusChange = async (projectId: string, newStatus: string) => {
        setActionLoading(projectId);
        try {
            await api.put(`/employee/projects/${projectId}/status`, { status: newStatus });
            showFeedback('success', 'Status updated!');
            fetchProjects();
        } catch (err: any) {
            showFeedback('error', err.response?.data?.detail || 'Failed to update status');
        } finally {
            setActionLoading('');
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'NOT_STARTED': return 'status-not-started';
            case 'IN_PROGRESS': return 'status-in-progress';
            case 'COMPLETED': return 'status-completed';
            default: return '';
        }
    };

    const getProgressPercent = (status: string) => {
        switch (status) {
            case 'NOT_STARTED': return 0;
            case 'IN_PROGRESS': return 50;
            case 'COMPLETED': return 100;
            default: return 0;
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
                    <h1>My Projects</h1>
                    <p className="dashboard-subtitle">View and manage your assigned projects</p>
                </div>

                {projects.length === 0 ? (
                    <div className="empty-state-container">
                        <div className="empty-state-icon">📋</div>
                        <h3>No Projects Assigned</h3>
                        <p>You haven't been assigned to any projects yet.</p>
                    </div>
                ) : (
                    <div className="project-grid">
                        {projects.map((p) => (
                            <div className="project-card project-card-employee" key={p.id}>
                                <div className="project-card-header">
                                    <h4>{p.name}</h4>
                                    <span className={`status-badge ${getStatusClass(p.status)}`}>
                                        {p.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="project-desc">{p.description}</p>

                                <div className="progress-bar-container">
                                    <div
                                        className="progress-bar"
                                        style={{ width: `${getProgressPercent(p.status)}%` }}
                                    ></div>
                                </div>

                                <div className="project-actions">
                                    <label>Update Status:</label>
                                    <select
                                        value={p.status}
                                        onChange={(e) => handleStatusChange(p.id, e.target.value)}
                                        disabled={actionLoading === p.id}
                                        className="status-select"
                                        id={`status-${p.id}`}
                                    >
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
        </>
    );
};

export default EmployeeDashboard;

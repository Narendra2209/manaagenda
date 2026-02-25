import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

interface Service {
    id: string;
    name: string;
    description: string;
    created_at: string;
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
    employee_ids: string[];
    status: string;
    created_at: string;
}

const ClientDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('services');
    const [services, setServices] = useState<Service[]>([]);
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState('');
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [svcRes, reqRes, projRes] = await Promise.all([
                api.get('/client/services'),
                api.get('/client/service-requests'),
                api.get('/client/projects'),
            ]);
            setServices(svcRes.data);
            setRequests(reqRes.data);
            setProjects(projRes.data);
        } catch (err) {
            console.error('Error fetching client data:', err);
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

    const handleRequestService = async (serviceId: string) => {
        setActionLoading(serviceId);
        try {
            await api.post('/client/service-requests', { service_id: serviceId });
            showFeedback('success', 'Service requested!');
            fetchData();
        } catch (err: any) {
            showFeedback('error', err.response?.data?.detail || 'Failed to request service');
        } finally {
            setActionLoading('');
        }
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
                    <h1>Client Dashboard</h1>
                    <p className="dashboard-subtitle">Browse services & track your projects</p>
                </div>

                <div className="tabs">
                    {['services', 'requests', 'projects'].map((tab) => (
                        <button
                            key={tab}
                            className={`tab ${activeTab === tab ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                            id={`client-tab-${tab}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Services Tab */}
                {activeTab === 'services' && (
                    <div className="tab-content">
                        {services.length === 0 ? (
                            <div className="empty-state-container">
                                <div className="empty-state-icon">🛠️</div>
                                <h3>No Services Available</h3>
                                <p>Check back later for available services.</p>
                            </div>
                        ) : (
                            <div className="service-grid">
                                {services.map((svc) => (
                                    <div className="service-card" key={svc.id}>
                                        <div className="service-icon">⚡</div>
                                        <h4>{svc.name}</h4>
                                        <p>{svc.description}</p>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleRequestService(svc.id)}
                                            disabled={actionLoading === svc.id}
                                            id={`request-${svc.id}`}
                                        >
                                            {actionLoading === svc.id ? '...' : 'Request Service'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Requests Tab */}
                {activeTab === 'requests' && (
                    <div className="tab-content">
                        {requests.length === 0 ? (
                            <div className="empty-state-container">
                                <div className="empty-state-icon">📝</div>
                                <h3>No Requests Yet</h3>
                                <p>Request a service to get started.</p>
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Request ID</th>
                                            <th>Service</th>
                                            <th>Status</th>
                                            <th>Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map((req) => (
                                            <tr key={req.id}>
                                                <td className="mono">{req.id.slice(-6)}</td>
                                                <td className="mono">{req.service_id.slice(-6)}</td>
                                                <td>
                                                    <span className={`status-badge ${getStatusClass(req.status)}`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(req.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Projects Tab */}
                {activeTab === 'projects' && (
                    <div className="tab-content">
                        {projects.length === 0 ? (
                            <div className="empty-state-container">
                                <div className="empty-state-icon">📁</div>
                                <h3>No Projects Yet</h3>
                                <p>Projects will appear here once your service requests are approved.</p>
                            </div>
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
                                            <span>👷 {p.employee_ids.length} team members</span>
                                            <span>📅 {new Date(p.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default ClientDashboard;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            const role = localStorage.getItem('role');
            switch (role) {
                case 'ADMIN':
                    navigate('/admin');
                    break;
                case 'EMPLOYEE':
                    navigate('/employee');
                    break;
                case 'CLIENT':
                    navigate('/client');
                    break;
                default:
                    navigate('/login');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-left">
                    <div className="login-brand">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="48" height="48" rx="14" fill="url(#loginGrad)" />
                            <path d="M14 18h20M14 24h14M14 30h18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="loginGrad" x1="0" y1="0" x2="48" y2="48">
                                    <stop stopColor="#6366f1" />
                                    <stop offset="1" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <h1>ProjectHub</h1>
                    </div>
                    <p className="login-subtitle">SaaS Project Management System</p>
                    <div className="login-features">
                        <div className="login-feature">
                            <span className="feature-icon">📊</span>
                            <span>Manage projects & teams</span>
                        </div>
                        <div className="login-feature">
                            <span className="feature-icon">🔒</span>
                            <span>Secure role-based access</span>
                        </div>
                        <div className="login-feature">
                            <span className="feature-icon">💬</span>
                            <span>Real-time messaging</span>
                        </div>
                    </div>
                </div>
                <div className="login-right">
                    <div className="login-card">
                        <h2>Welcome back</h2>
                        <p className="login-card-sub">Sign in to your account</p>
                        {error && <div className="alert alert-error">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-full" id="login-btn" disabled={loading}>
                                {loading ? (
                                    <span className="spinner-inline"></span>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>
                        <div className="login-demo-info">
                            <p><strong>Demo Admin:</strong> admin@example.com / admin123</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

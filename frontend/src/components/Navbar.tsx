import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
    const { userName, role, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleBadgeClass = () => {
        switch (role) {
            case 'ADMIN': return 'badge badge-admin';
            case 'EMPLOYEE': return 'badge badge-employee';
            case 'CLIENT': return 'badge badge-client';
            default: return 'badge';
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="28" height="28" rx="8" fill="url(#navGrad)" />
                    <path d="M8 10h12M8 14h8M8 18h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    <defs>
                        <linearGradient id="navGrad" x1="0" y1="0" x2="28" y2="28">
                            <stop stopColor="#6366f1" />
                            <stop offset="1" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>
                </svg>
                <span className="navbar-title">ProjectHub</span>
            </div>
            <div className="navbar-right">
                <span className="navbar-user">{userName}</span>
                <span className={getRoleBadgeClass()}>{role}</span>
                <button className="btn btn-outline btn-sm" onClick={handleLogout} id="logout-btn">
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;

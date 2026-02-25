import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface AuthContextType {
    token: string | null;
    role: string | null;
    userId: string | null;
    userName: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
    const [userId, setUserId] = useState<string | null>(localStorage.getItem('user_id'));
    const [userName, setUserName] = useState<string | null>(localStorage.getItem('user_name'));

    const isAuthenticated = !!token;

    const login = async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const { access_token, role: userRole, user_id, name } = response.data;

        localStorage.setItem('token', access_token);
        localStorage.setItem('role', userRole);
        localStorage.setItem('user_id', user_id);
        localStorage.setItem('user_name', name);

        setToken(access_token);
        setRole(userRole);
        setUserId(user_id);
        setUserName(name);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_name');
        setToken(null);
        setRole(null);
        setUserId(null);
        setUserName(null);
    };

    return (
        <AuthContext.Provider value={{ token, role, userId, userName, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

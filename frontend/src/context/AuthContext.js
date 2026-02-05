import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data.data);
                    setIsAuthenticated(true);
                } catch (error) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { accessToken, refreshToken, user: userData } = response.data.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            setUser(userData);
            setIsAuthenticated(true);
            toast.success('Login successful!');

            return { success: true, user: userData };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const register = async (name, email, password, confirmPassword, role = 'user') => {
        try {
            const response = await api.post('/auth/register', {
                name,
                email,
                password,
                confirmPassword,
                role
            });
            const { accessToken, refreshToken, user: userData } = response.data.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            setUser(userData);
            setIsAuthenticated(true);
            toast.success('Registration successful!');

            return { success: true, user: userData };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            const errors = error.response?.data?.errors;
            toast.error(errors ? errors[0].message : message);
            return { success: false, message, errors };
        }
    };

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // Ignore logout errors
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setIsAuthenticated(false);
            toast.info('Logged out successfully');
        }
    }, []);

    const updateProfile = async (data) => {
        try {
            const response = await api.put('/auth/update-profile', data);
            setUser(response.data.data);
            toast.success('Profile updated successfully!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Update failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const updatePassword = async (currentPassword, newPassword, confirmNewPassword) => {
        try {
            await api.put('/auth/update-password', {
                currentPassword,
                newPassword,
                confirmNewPassword
            });
            toast.success('Password updated successfully!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Password update failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        updatePassword
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

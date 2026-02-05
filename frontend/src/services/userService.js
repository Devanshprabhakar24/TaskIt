import api from './api';

const userService = {
    // Get all users (admin only)
    getUsers: async (params = {}) => {
        const response = await api.get('/users', { params });
        return response.data;
    },

    // Get single user (admin only)
    getUser: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    // Create user (admin only)
    createUser: async (data) => {
        const response = await api.post('/users', data);
        return response.data;
    },

    // Update user (admin only)
    updateUser: async (id, data) => {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },

    // Delete user (admin only)
    deleteUser: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },

    // Get user statistics (admin only)
    getStats: async () => {
        const response = await api.get('/users/stats');
        return response.data;
    }
};

export default userService;

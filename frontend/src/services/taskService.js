import api from './api';

const taskService = {
    // Get all tasks with filters
    getTasks: async (params = {}) => {
        const response = await api.get('/tasks', { params });
        return response.data;
    },

    // Get single task
    getTask: async (id) => {
        const response = await api.get(`/tasks/${id}`);
        return response.data;
    },

    // Create new task
    createTask: async (data) => {
        const response = await api.post('/tasks', data);
        return response.data;
    },

    // Update task
    updateTask: async (id, data) => {
        const response = await api.put(`/tasks/${id}`, data);
        return response.data;
    },

    // Delete task
    deleteTask: async (id) => {
        const response = await api.delete(`/tasks/${id}`);
        return response.data;
    },

    // Get task statistics
    getStats: async () => {
        const response = await api.get('/tasks/stats');
        return response.data;
    },

    // Bulk update status
    bulkUpdateStatus: async (taskIds, status) => {
        const response = await api.patch('/tasks/bulk-status', { taskIds, status });
        return response.data;
    },

    // Bulk delete
    bulkDelete: async (taskIds) => {
        const response = await api.delete('/tasks/bulk-delete', { data: { taskIds } });
        return response.data;
    },

    // Admin: Get all tasks
    getAllTasksAdmin: async (params = {}) => {
        const response = await api.get('/tasks/admin/all', { params });
        return response.data;
    },

    // Admin: Update any task
    adminUpdateTask: async (id, data) => {
        const response = await api.put(`/tasks/${id}`, data);
        return response.data;
    }
};

export default taskService;

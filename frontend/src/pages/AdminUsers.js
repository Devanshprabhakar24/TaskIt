import React, { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';
import taskService from '../services/taskService';
import { toast } from 'react-toastify';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [tasksPagination, setTasksPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('users');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });
    const [formLoading, setFormLoading] = useState(false);

    const fetchUsers = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const response = await userService.getUsers({ page, limit: 10 });
            setUsers(response.data.users);
            setPagination(response.data.pagination);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const response = await userService.getStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to load stats');
        }
    }, []);

    const fetchTasks = useCallback(async (page = 1) => {
        try {
            setTasksLoading(true);
            const response = await taskService.getAllTasksAdmin({ page, limit: 10 });
            setTasks(response.data.tasks);
            setTasksPagination(response.data.pagination);
        } catch (error) {
            toast.error('Failed to load tasks');
        } finally {
            setTasksLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(1);
        fetchStats();
        fetchTasks(1);
    }, [fetchUsers, fetchStats, fetchTasks]);

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'user'
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'user'
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            if (editingUser) {
                const updateData = {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role
                };
                await userService.updateUser(editingUser._id, updateData);
                toast.success('User updated successfully!');
            } else {
                await userService.createUser(formData);
                toast.success('User created successfully!');
            }
            closeModal();
            fetchUsers(pagination.page);
            fetchStats();
        } catch (error) {
            const message = error.response?.data?.message || 'Operation failed';
            toast.error(message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This will also delete all their tasks.')) {
            return;
        }

        try {
            await userService.deleteUser(userId);
            toast.success('User deleted successfully!');
            fetchUsers(pagination.page);
            fetchStats();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete user';
            toast.error(message);
        }
    };

    const handleTaskStatusChange = async (taskId, newStatus) => {
        try {
            await taskService.updateTask(taskId, { status: newStatus });
            toast.success('Task status updated successfully!');
            fetchTasks(tasksPagination.page);
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update task status';
            toast.error(message);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">User Management</h1>
                <p className="page-subtitle">Manage system users</p>
            </div>

            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div>
                                <p className="stat-label">Total Users</p>
                                <p className="stat-value">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div>
                                <p className="stat-label">Admins</p>
                                <p className="stat-value">{stats.admins}</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div>
                                <p className="stat-label">Regular Users</p>
                                <p className="stat-value">{stats.users}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
                    <button
                        className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </button>
                    <button
                        className={`btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('tasks')}
                    >
                        Tasks
                    </button>
                </div>
            </div>

            {activeTab === 'users' && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">All Users</h2>
                        <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
                            + Add User
                        </button>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="loading-screen" style={{ minHeight: '200px' }}>
                                <div className="spinner"></div>
                                <p>Loading users...</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="empty-state">
                                <h3>No users found</h3>
                            </div>
                        ) : (
                            <>
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Created</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(user => (
                                                <tr key={user._id}>
                                                    <td>{user.name}</td>
                                                    <td>{user.email}</td>
                                                    <td>
                                                        <span className={`task-tag ${user.role === 'admin' ? 'priority-high' : 'priority-low'}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <div className="task-actions">
                                                            <button className="icon-btn" onClick={() => openModal(user)} title="Edit">
                                                                Edit
                                                            </button>
                                                            <button className="icon-btn delete" onClick={() => handleDelete(user._id)} title="Delete">
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {pagination.pages > 1 && (
                                    <div className="pagination">
                                        <button
                                            className="pagination-btn"
                                            onClick={() => fetchUsers(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                        >
                                            ← Previous
                                        </button>
                                        <span className="pagination-info">
                                            Page {pagination.page} of {pagination.pages}
                                        </span>
                                        <button
                                            className="pagination-btn"
                                            onClick={() => fetchUsers(pagination.page + 1)}
                                            disabled={pagination.page === pagination.pages}
                                        >
                                            Next →
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'tasks' && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">All Tasks</h2>
                    </div>
                    <div className="card-body">
                        {tasksLoading ? (
                            <div className="loading-screen" style={{ minHeight: '200px' }}>
                                <div className="spinner"></div>
                                <p>Loading tasks...</p>
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="empty-state">
                                <h3>No tasks found</h3>
                            </div>
                        ) : (
                            <>
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>User</th>
                                                <th>Status</th>
                                                <th>Priority</th>
                                                <th>Due Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tasks.map(task => (
                                                <tr key={task._id}>
                                                    <td>{task.title}</td>
                                                    <td>{task.user?.name || 'Unknown'}</td>
                                                    <td>
                                                        <select
                                                            className="form-control"
                                                            value={task.status}
                                                            onChange={(e) => handleTaskStatusChange(task._id, e.target.value)}
                                                            style={{ minWidth: '120px' }}
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="in-progress">In Progress</option>
                                                            <option value="completed">Completed</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <span className={`task-tag priority-${task.priority}`}>
                                                            {task.priority}
                                                        </span>
                                                    </td>
                                                    <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {tasksPagination.pages > 1 && (
                                    <div className="pagination">
                                        <button
                                            className="pagination-btn"
                                            onClick={() => fetchTasks(tasksPagination.page - 1)}
                                            disabled={tasksPagination.page === 1}
                                        >
                                            ← Previous
                                        </button>
                                        <span className="pagination-info">
                                            Page {tasksPagination.page} of {tasksPagination.pages}
                                        </span>
                                        <button
                                            className="pagination-btn"
                                            onClick={() => fetchTasks(tasksPagination.page + 1)}
                                            disabled={tasksPagination.page === tasksPagination.pages}
                                        >
                                            Next →
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* User Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingUser ? 'Edit User' : 'Create New User'}
                            </h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="name">Full Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="form-control"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                {!editingUser && (
                                    <div className="form-group">
                                        <label htmlFor="password">Password *</label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            className="form-control"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required={!editingUser}
                                            minLength={6}
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label htmlFor="role">Role</label>
                                    <select
                                        id="role"
                                        name="role"
                                        className="form-control"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                                    {formLoading ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;

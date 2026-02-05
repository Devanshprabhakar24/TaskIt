import React, { useState, useEffect, useCallback } from 'react';
import taskService from '../services/taskService';
import { toast } from 'react-toastify';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: ''
    });
    const [formLoading, setFormLoading] = useState(false);

    const fetchTasks = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params = { page, limit: 10 };
            if (filter !== 'all') {
                params.status = filter;
            }
            const response = await taskService.getTasks(params);
            setTasks(response.data.tasks);
            setPagination(response.data.pagination);
        } catch (error) {
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchTasks(1);
    }, [fetchTasks]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    const openModal = (task = null) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title,
                description: task.description || '',
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
            });
        } else {
            setEditingTask(null);
            setFormData({
                title: '',
                description: '',
                status: 'pending',
                priority: 'medium',
                dueDate: ''
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTask(null);
        setFormData({
            title: '',
            description: '',
            status: 'pending',
            priority: 'medium',
            dueDate: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.error('Title is required');
            return;
        }

        setFormLoading(true);
        try {
            const data = {
                ...formData,
                dueDate: formData.dueDate || undefined
            };

            if (editingTask) {
                await taskService.updateTask(editingTask._id, data);
                toast.success('Task updated successfully!');
            } else {
                await taskService.createTask(data);
                toast.success('Task created successfully!');
            }
            closeModal();
            fetchTasks(pagination.page);
        } catch (error) {
            const message = error.response?.data?.message || 'Operation failed';
            toast.error(message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            await taskService.deleteTask(taskId);
            toast.success('Task deleted successfully!');
            fetchTasks(pagination.page);
        } catch (error) {
            toast.error('Failed to delete task');
        }
    };

    const handleStatusToggle = async (task) => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        try {
            await taskService.updateTask(task._id, { status: newStatus });
            toast.success(`Task marked as ${newStatus}`);
            fetchTasks(pagination.page);
        } catch (error) {
            toast.error('Failed to update task');
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Tasks</h1>
                <p className="page-subtitle">Manage your tasks efficiently</p>
            </div>

            <div className="tasks-header">
                <div className="filters">
                    {['all', 'pending', 'in-progress', 'completed'].map(f => (
                        <button
                            key={f}
                            className={`filter-btn ${filter === f ? 'active' : ''}`}
                            onClick={() => handleFilterChange(f)}
                        >
                            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
                        </button>
                    ))}
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    + New Task
                </button>
            </div>

            {loading ? (
                <div className="loading-screen" style={{ minHeight: '300px' }}>
                    <div className="spinner"></div>
                    <p>Loading tasks...</p>
                </div>
            ) : tasks.length === 0 ? (
                <div className="card">
                    <div className="card-body">
                        <div className="empty-state">
                            <h3>No tasks found</h3>
                            <p>
                                {filter === 'all'
                                    ? 'Create your first task to get started!'
                                    : `No ${filter} tasks at the moment.`}
                            </p>
                            <button className="btn btn-primary" onClick={() => openModal()} style={{ marginTop: '1rem' }}>
                                Create Task
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="task-list">
                        {tasks.map(task => (
                            <div key={task._id} className="task-item">
                                <input
                                    type="checkbox"
                                    className="task-checkbox"
                                    checked={task.status === 'completed'}
                                    onChange={() => handleStatusToggle(task)}
                                />
                                <div className="task-content">
                                    <h3 className={`task-title ${task.status === 'completed' ? 'completed' : ''}`}>
                                        {task.title}
                                    </h3>
                                    {task.description && (
                                        <p className="task-description">{task.description}</p>
                                    )}
                                    <div className="task-meta">
                                        <span className={`task-tag priority-${task.priority}`}>
                                            {task.priority}
                                        </span>
                                        <span className={`task-tag status-${task.status}`}>
                                            {task.status}
                                        </span>
                                        {task.dueDate && (
                                            <span className="task-tag">
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="task-actions">
                                    <button className="icon-btn" onClick={() => openModal(task)} title="Edit">
                                        Edit
                                    </button>
                                    <button className="icon-btn delete" onClick={() => handleDelete(task._id)} title="Delete">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                onClick={() => fetchTasks(pagination.page - 1)}
                                disabled={pagination.page === 1}
                            >
                                ← Previous
                            </button>
                            <span className="pagination-info">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                className="pagination-btn"
                                onClick={() => fetchTasks(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Task Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingTask ? 'Edit Task' : 'Create New Task'}
                            </h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="title">Title *</label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        className="form-control"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Enter task title"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        className="form-control"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Enter task description"
                                        rows={3}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="status">Status</label>
                                    <select
                                        id="status"
                                        name="status"
                                        className="form-control"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="priority">Priority</label>
                                    <select
                                        id="priority"
                                        name="priority"
                                        className="form-control"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="dueDate">Due Date</label>
                                    <input
                                        type="date"
                                        id="dueDate"
                                        name="dueDate"
                                        className="form-control"
                                        value={formData.dueDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                                    {formLoading ? 'Saving...' : (editingTask ? 'Update Task' : 'Create Task')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;

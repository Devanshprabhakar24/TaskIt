import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import taskService from '../services/taskService';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentTasks, setRecentTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, tasksRes] = await Promise.all([
                    taskService.getStats(),
                    taskService.getTasks({ limit: 5, sortBy: 'createdAt', order: 'desc' })
                ]);
                setStats(statsRes.data);
                setRecentTasks(tasksRes.data.tasks);
            } catch (error) {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">{getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h1>
                <p className="page-subtitle">Here's an overview of your tasks</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div>
                            <p className="stat-label">Pending Tasks</p>
                            <p className="stat-value">{stats?.byStatus?.pending || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <div>
                            <p className="stat-label">In Progress</p>
                            <p className="stat-value">{stats?.byStatus?.['in-progress'] || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <div>
                            <p className="stat-label">Completed</p>
                            <p className="stat-value">{stats?.byStatus?.completed || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <div>
                            <p className="stat-label">Overdue</p>
                            <p className="stat-value">{stats?.overdue || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Recent Tasks</h2>
                    <Link to="/tasks" className="btn btn-primary btn-sm">
                        View All Tasks
                    </Link>
                </div>
                <div className="card-body">
                    {recentTasks.length === 0 ? (
                        <div className="empty-state">
                            <h3>No tasks yet</h3>
                            <p>Create your first task to get started!</p>
                            <Link to="/tasks" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                Create Task
                            </Link>
                        </div>
                    ) : (
                        <div className="task-list">
                            {recentTasks.map(task => (
                                <div key={task._id} className="task-item">
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
                                                    📅 {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {stats?.dueToday > 0 && (
                <div className="card" style={{ marginTop: '1.5rem', borderLeft: '4px solid #ed8936' }}>
                    <div className="card-body">
                        <p style={{ margin: 0 }}>
                            <strong>⚡ Heads up!</strong> You have {stats.dueToday} task{stats.dueToday > 1 ? 's' : ''} due today.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

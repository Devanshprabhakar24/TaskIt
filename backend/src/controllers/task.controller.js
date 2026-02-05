const Task = require('../models/Task');

/**
 * @desc    Get all tasks for logged in user
 * @route   GET /api/v1/tasks
 * @access  Private
 */
const getTasks = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build query
        const query = { user: req.user._id };

        // Filter by status
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Filter by priority
        if (req.query.priority) {
            query.priority = req.query.priority;
        }

        // Search in title and description
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Filter by tags
        if (req.query.tags) {
            const tags = req.query.tags.split(',').map(tag => tag.trim().toLowerCase());
            query.tags = { $in: tags };
        }

        // Build sort
        let sort = { createdAt: -1 };
        if (req.query.sortBy) {
            const order = req.query.order === 'asc' ? 1 : -1;
            sort = { [req.query.sortBy]: order };
        }

        const tasks = await Task.find(query)
            .skip(skip)
            .limit(limit)
            .sort(sort);

        const total = await Task.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                tasks,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single task
 * @route   GET /api/v1/tasks/:id
 * @access  Private
 */
const getTask = async (req, res, next) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create new task
 * @route   POST /api/v1/tasks
 * @access  Private
 */
const createTask = async (req, res, next) => {
    try {
        const { title, description, status, priority, dueDate, tags } = req.body;

        const task = await Task.create({
            title,
            description,
            status,
            priority,
            dueDate,
            tags,
            user: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update task
 * @route   PUT /api/v1/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res, next) => {
    try {
        // Admin can update any task, regular users can only update their own
        let query = { _id: req.params.id };
        if (req.user.role !== 'admin') {
            query.user = req.user._id;
        }

        let task = await Task.findOne(query);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        const { title, description, status, priority, dueDate, tags } = req.body;

        // Update fields
        if (title) task.title = title;
        if (description !== undefined) task.description = description;
        if (status) task.status = status;
        if (priority) task.priority = priority;
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (tags) task.tags = tags;

        await task.save();

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: task
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/v1/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get task statistics
 * @route   GET /api/v1/tasks/stats
 * @access  Private
 */
const getTaskStats = async (req, res, next) => {
    try {
        const stats = await Task.getStats(req.user._id);

        // Get overdue tasks count
        const overdueTasks = await Task.countDocuments({
            user: req.user._id,
            status: { $ne: 'completed' },
            dueDate: { $lt: new Date() }
        });

        // Get tasks due today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const tasksDueToday = await Task.countDocuments({
            user: req.user._id,
            status: { $ne: 'completed' },
            dueDate: { $gte: today, $lt: tomorrow }
        });

        res.status(200).json({
            success: true,
            data: {
                ...stats,
                overdue: overdueTasks,
                dueToday: tasksDueToday
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Bulk update task status
 * @route   PATCH /api/v1/tasks/bulk-status
 * @access  Private
 */
const bulkUpdateStatus = async (req, res, next) => {
    try {
        const { taskIds, status } = req.body;

        if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Task IDs array is required'
            });
        }

        if (!['pending', 'in-progress', 'completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const result = await Task.updateMany(
            { _id: { $in: taskIds }, user: req.user._id },
            { status, ...(status === 'completed' ? { completedAt: new Date() } : { $unset: { completedAt: 1 } }) }
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} tasks updated successfully`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Bulk delete tasks
 * @route   DELETE /api/v1/tasks/bulk-delete
 * @access  Private
 */
const bulkDelete = async (req, res, next) => {
    try {
        const { taskIds } = req.body;

        if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Task IDs array is required'
            });
        }

        const result = await Task.deleteMany({
            _id: { $in: taskIds },
            user: req.user._id
        });

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} tasks deleted successfully`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all tasks (Admin only)
 * @route   GET /api/v1/tasks/admin/all
 * @access  Private/Admin
 */
const getAllTasksAdmin = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = {};

        if (req.query.userId) {
            query.user = req.query.userId;
        }
        if (req.query.status) {
            query.status = req.query.status;
        }

        const tasks = await Task.find(query)
            .populate('user', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Task.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                tasks,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    getTaskStats,
    bulkUpdateStatus,
    bulkDelete,
    getAllTasksAdmin
};

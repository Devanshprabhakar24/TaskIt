const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'in-progress', 'completed'],
            message: 'Status must be pending, in-progress, or completed'
        },
        default: 'pending'
    },
    priority: {
        type: String,
        enum: {
            values: ['low', 'medium', 'high'],
            message: 'Priority must be low, medium, or high'
        },
        default: 'medium'
    },
    dueDate: {
        type: Date,
        validate: {
            validator: function (value) {
                // Due date should be in the future or today (only for new tasks)
                if (this.isNew && value) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return value >= today;
                }
                return true;
            },
            message: 'Due date must be today or in the future'
        }
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Task must belong to a user']
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ title: 'text', description: 'text' });

// Virtual: Check if task is overdue
taskSchema.virtual('isOverdue').get(function () {
    if (this.status === 'completed' || !this.dueDate) {
        return false;
    }
    return new Date() > this.dueDate;
});

// Pre-save middleware: Set completedAt when status changes to completed
taskSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'completed') {
        this.completedAt = new Date();
    }
    if (this.isModified('status') && this.status !== 'completed') {
        this.completedAt = undefined;
    }
    next();
});

// Static: Get task statistics for a user
taskSchema.statics.getStats = async function (userId) {
    const stats = await this.aggregate([
        { $match: { user: userId } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    const priorityStats = await this.aggregate([
        { $match: { user: userId } },
        {
            $group: {
                _id: '$priority',
                count: { $sum: 1 }
            }
        }
    ]);

    return {
        byStatus: stats.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {}),
        byPriority: priorityStats.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {})
    };
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;

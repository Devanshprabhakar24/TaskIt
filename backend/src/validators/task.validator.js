const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation middleware to check for errors
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

/**
 * Create task validation rules
 */
const createTaskValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

    body('status')
        .optional()
        .isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),

    body('dueDate')
        .optional()
        .isISO8601().withMessage('Invalid date format')
        .custom((value) => {
            const date = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date < today) {
                throw new Error('Due date must be today or in the future');
            }
            return true;
        }),

    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array')
        .custom((value) => {
            if (value.length > 10) {
                throw new Error('Maximum 10 tags allowed');
            }
            return true;
        }),

    validate
];

/**
 * Update task validation rules
 */
const updateTaskValidation = [
    param('id')
        .isMongoId().withMessage('Invalid task ID'),

    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

    body('status')
        .optional()
        .isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),

    body('dueDate')
        .optional()
        .isISO8601().withMessage('Invalid date format'),

    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array'),

    validate
];

/**
 * Get task by ID validation
 */
const getTaskValidation = [
    param('id')
        .isMongoId().withMessage('Invalid task ID'),

    validate
];

/**
 * Query validation for listing tasks
 */
const listTasksValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

    query('status')
        .optional()
        .isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status filter'),

    query('priority')
        .optional()
        .isIn(['low', 'medium', 'high']).withMessage('Invalid priority filter'),

    query('sortBy')
        .optional()
        .isIn(['createdAt', 'dueDate', 'priority', 'status', 'title']).withMessage('Invalid sort field'),

    query('order')
        .optional()
        .isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),

    validate
];

module.exports = {
    validate,
    createTaskValidation,
    updateTaskValidation,
    getTaskValidation,
    listTasksValidation
};

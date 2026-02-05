# Task Management API

A scalable REST API with Authentication, Role-Based Access Control, and a React frontend.

## Features

### Backend

- User registration & login with password hashing (bcrypt) and JWT authentication
- Role-based access control (user vs admin)
- CRUD APIs for tasks with filtering, sorting, and pagination
- API versioning (`/api/v1/`)
- Input validation and sanitization
- Rate limiting and security headers (Helmet)
- Comprehensive error handling
- Swagger API documentation

### Frontend

- React.js with React Router
- User authentication (login/register)
- Protected dashboard with JWT
- Full task CRUD operations
- Admin user management
- Toast notifications for success/error messages
- Responsive design

## Tech Stack

### Backend

- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation
- Swagger for API documentation

### Frontend

- React.js 18
- React Router v6
- Axios for API calls
- React Toastify for notifications

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── logger.js
│   │   │   └── swagger.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── task.controller.js
│   │   │   └── user.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── Task.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   └── v1/
│   │   │       ├── auth.routes.js
│   │   │       ├── task.routes.js
│   │   │       └── user.routes.js
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   └── task.validator.js
│   │   └── server.js
│   ├── logs/
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminRoute.js
│   │   │   ├── Layout.js
│   │   │   └── PrivateRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── AdminUsers.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js
│   │   │   ├── Profile.js
│   │   │   ├── Register.js
│   │   │   └── Tasks.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── taskService.js
│   │   │   └── userService.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.js
│   │   └── index.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
├── postman_collection.json
├── SCALABILITY.md
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://dev24prabhakar_db_user:EGq7n2nN63HtUvHz@experience.mujm1aj.mongodb.net

# JWT Configuration
JWT_SECRET=qwertyuiop
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=1234567890qwertyuiop
JWT_REFRESH_EXPIRE=30d

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

4. Start the server:

```bash
# Development mode
npm run dev

# Production mode
npm start
```

5. API Documentation: Open `http://localhost:5000/api-docs`

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open `http://localhost:3000` in your browser

## API Endpoints

### Authentication

| Method | Endpoint                       | Description          |
| ------ | ------------------------------ | -------------------- |
| POST   | `/api/v1/auth/register`        | Register new user    |
| POST   | `/api/v1/auth/login`           | Login user           |
| POST   | `/api/v1/auth/logout`          | Logout user          |
| GET    | `/api/v1/auth/me`              | Get current user     |
| POST   | `/api/v1/auth/refresh-token`   | Refresh access token |
| PUT    | `/api/v1/auth/update-password` | Update password      |
| PUT    | `/api/v1/auth/update-profile`  | Update profile       |

### Tasks

| Method | Endpoint                    | Description                  |
| ------ | --------------------------- | ---------------------------- |
| GET    | `/api/v1/tasks`             | Get all tasks (with filters) |
| GET    | `/api/v1/tasks/:id`         | Get single task              |
| POST   | `/api/v1/tasks`             | Create new task              |
| PUT    | `/api/v1/tasks/:id`         | Update task                  |
| DELETE | `/api/v1/tasks/:id`         | Delete task                  |
| GET    | `/api/v1/tasks/stats`       | Get task statistics          |
| PATCH  | `/api/v1/tasks/bulk-status` | Bulk update status           |
| DELETE | `/api/v1/tasks/bulk-delete` | Bulk delete tasks            |

### Users (Admin Only)

| Method | Endpoint              | Description         |
| ------ | --------------------- | ------------------- |
| GET    | `/api/v1/users`       | Get all users       |
| GET    | `/api/v1/users/:id`   | Get single user     |
| POST   | `/api/v1/users`       | Create user         |
| PUT    | `/api/v1/users/:id`   | Update user         |
| DELETE | `/api/v1/users/:id`   | Delete user         |
| GET    | `/api/v1/users/stats` | Get user statistics |

## Database Schema

### User Model

```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin']),
  refreshToken: String,
  passwordChangedAt: Date,
  timestamps: true
}
```

### Task Model

```javascript
{
  title: String (required, 3-100 chars),
  description: String (max 1000 chars),
  status: String (enum: ['pending', 'in-progress', 'completed']),
  priority: String (enum: ['low', 'medium', 'high']),
  dueDate: Date,
  tags: [String],
  user: ObjectId (ref: User),
  completedAt: Date,
  timestamps: true
}
```

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with salt rounds of 12
2. **JWT Authentication**: Access tokens expire in 7 days, refresh tokens in 30 days
3. **Rate Limiting**: 100 requests per 15 minutes per IP
4. **Helmet**: Security headers for XSS, clickjacking, etc.
5. **CORS**: Configured for frontend origin only
6. **Input Validation**: All inputs are validated and sanitized
7. **Role-Based Access**: Admin-only routes are protected

## Error Handling

All API responses follow a consistent format:

```json
// Success
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Error description",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

## Testing

### Test Credentials

After seeding, you can use:

- **Admin**: admin@example.com / Admin123
- **User**: user@example.com / User123

### Postman Collection

A Postman collection is included (`postman_collection.json`) for testing all API endpoints. Import it into Postman to quickly test the API.

## Logging

The application uses Winston for comprehensive logging:

| Log File       | Content                        |
| -------------- | ------------------------------ |
| `error.log`    | Error-level logs only          |
| `combined.log` | All logs (info, warn, error)   |
| `http.log`     | HTTP request logs (via morgan) |

**Features:**

- Timestamped entries with log levels
- Separate files for different log types
- Console output in development mode
- JSON format for easy parsing

**Log Location:** `backend/logs/`

## Deployment

### Docker Deployment (Recommended)

The easiest way to run the entire application:

```bash
# Clone the repository
git clone <repository-url>
cd task-management-api

# Start all services (MongoDB, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Access the application:

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Swagger Docs**: http://localhost:5000/api-docs

### Backend (Example: Railway/Render)

1. Set environment variables in your hosting platform
2. Ensure MongoDB Atlas connection string is configured
3. Deploy from GitHub repository

### Frontend (Example: Vercel/Netlify)

1. Set `REACT_APP_API_URL` to your backend URL
2. Build the project: `npm run build`
3. Deploy the `build` folder

## Scalability

For detailed information on scaling this application, including horizontal scaling, caching with Redis, and microservices architecture patterns, see [SCALABILITY.md](SCALABILITY.md).

## Author

Backend Developer Intern Assignment

## License

MIT

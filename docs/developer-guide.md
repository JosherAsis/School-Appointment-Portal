# School Appointment Portal - Developer Guide

This guide provides technical documentation for developers working on the School Appointment Portal.

## Project Structure

```
school-appointment-portal/
├── backend/                 # Node.js/Express backend
│   ├── db/                  # Database scripts and schema
│   ├── middleware/          # Express middleware
│   ├── routes/              # API routes
│   ├── scripts/             # Utility scripts
│   ├── utils/               # Utility functions
│   ├── .env                 # Environment variables
│   ├── package.json         # Backend dependencies
│   └── server.js            # Main server file
├── frontend/                # React.js frontend
│   ├── public/              # Static files
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context providers
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── App.js           # Main App component
│   │   └── index.js         # Entry point
│   ├── package.json         # Frontend dependencies
│   └── .env                 # Frontend environment variables
├── docs/                    # Documentation
└── README.md                # Project overview
```

## Backend Architecture

### Server Setup

The backend is built with Express.js and follows a modular architecture:

- `server.js`: Entry point that sets up the Express server, middleware, and routes
- `db.js`: Database connection pool using MySQL2
- `routes/`: API endpoints organized by resource
- `middleware/`: Custom middleware functions
- `utils/`: Utility functions and services

### Database Schema

The database uses MySQL with the following tables:

- `users`: User accounts with authentication information
- `students`: Student profiles linked to user accounts
- `time_slots`: Available appointment time slots
- `appointments`: Appointment records linking students and time slots

### Authentication

Authentication is implemented using JSON Web Tokens (JWT):

- `auth.js` middleware verifies the token in the `x-auth-token` header
- Tokens are issued during login and registration
- Password reset uses a separate token system with expiration

### Email Notifications

Email notifications are handled by Nodemailer:

- `emailService.js` provides functions for different notification types
- Templates are defined for each notification type
- SMTP configuration is loaded from environment variables

## Frontend Architecture

### Component Structure

The frontend is built with React.js and follows a component-based architecture:

- `App.js`: Main component that sets up routing and context providers
- `context/`: React context for global state management
- `components/`: Reusable UI components
- `pages/`: Page-level components
- `services/`: API service functions

### State Management

State management is implemented using React Context API:

- `AuthContext.js`: Manages user authentication state
- `NotificationContext.js`: Manages notification display

### Routing

Routing is handled by React Router with protected routes:

- `ProtectedRoute.js`: Higher-order component that restricts access based on authentication
- `AdminRoute.js`: Restricts access to admin users only
- `StudentRoute.js`: Restricts access to student users only

## API Reference

### Authentication Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/auth/register` | POST | Register a new user | `{ name, email, password, student_id, department, year_level }` | `{ token, user }` |
| `/api/auth/login` | POST | Login a user | `{ email, password }` | `{ token, user }` |
| `/api/auth/user` | GET | Get current user | - | `{ user }` |
| `/api/auth/forgot-password` | POST | Request password reset | `{ email }` | `{ msg }` |
| `/api/auth/reset-password/:token` | GET | Verify reset token | - | `{ msg }` |
| `/api/auth/reset-password/:token` | POST | Reset password | `{ password }` | `{ msg }` |

### Appointment Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/appointments` | GET | Get appointments | - | `[appointments]` |
| `/api/appointments/:id` | GET | Get appointment | - | `{ appointment }` |
| `/api/appointments` | POST | Create appointment | `{ date, time_slot_id, reason }` | `{ appointment }` |
| `/api/appointments/:id` | PUT | Update appointment | `{ status, admin_notes }` | `{ msg }` |
| `/api/appointments/:id` | DELETE | Cancel appointment | - | `{ msg }` |

### Time Slot Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/time-slots` | GET | Get all time slots | - | `[timeSlots]` |
| `/api/time-slots/available` | GET | Get available slots | Query: `date` | `[timeSlots]` |
| `/api/time-slots` | POST | Create time slot | `{ day_of_week, start_time, end_time, max_appointments }` | `{ timeSlot }` |
| `/api/time-slots/:id` | PUT | Update time slot | `{ day_of_week, start_time, end_time, max_appointments, is_available }` | `{ msg }` |
| `/api/time-slots/:id` | DELETE | Delete time slot | - | `{ msg }` |

### Notification Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/notifications/email` | POST | Send email | `{ type, recipient, subject, appointmentData }` | `{ msg }` |
| `/api/notifications/test` | POST | Test email | `{ email }` | `{ msg }` |

## Development Workflow

### Setting Up the Development Environment

1. Clone the repository
2. Install backend dependencies: `cd backend && npm install`
3. Install frontend dependencies: `cd frontend && npm install`
4. Set up environment variables in `.env` files
5. Create the database: `cd backend && node db/create-db.js`
6. Start the backend: `npm run dev`
7. Start the frontend: `cd frontend && npm start`



### Database Migrations

To update the database schema:

1. Modify the schema in `db/schema.sql`
2. Create migration script in `db/update-schema.sql`
3. Run the update script: `npm run update-db`

## Deployment

### Backend Deployment

1. Set up a production MySQL database
2. Configure environment variables for production
3. Build the backend: `npm run build`
4. Start the server: `npm start`

### Frontend Deployment

1. Configure the production API URL in `.env`
2. Build the frontend: `npm run build`
3. Deploy the build folder to a static hosting service

## Best Practices

### Code Style

- Follow the Airbnb JavaScript Style Guide
- Use ESLint for code linting
- Use Prettier for code formatting

### Security

- Store sensitive information in environment variables
- Use parameterized queries to prevent SQL injection
- Validate and sanitize all user input
- Use HTTPS in production
- Implement rate limiting for authentication endpoints

### Performance

- Use connection pooling for database connections
- Implement caching for frequently accessed data
- Optimize database queries with proper indexing
- Use pagination for large data sets

## Troubleshooting

### Common Issues

- **Database Connection Errors**: Check database credentials and connection string
- **JWT Errors**: Verify the JWT secret is properly set
- **Email Sending Failures**: Check SMTP configuration and credentials
- **CORS Errors**: Ensure the frontend origin is allowed in the backend CORS configuration

### Debugging

- Use `console.log()` for basic debugging
- Check server logs for backend errors
- Use React DevTools for frontend debugging
- Use network tab in browser developer tools to inspect API requests

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.

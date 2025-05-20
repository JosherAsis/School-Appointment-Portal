# School Appointment Portal

A comprehensive web application for managing student appointments with school administrators.

## Features

- **User Authentication**
  - Registration and login for students and administrators
  - Role-based access control
  - Password reset functionality
  - JWT-based authentication

- **Appointment Management**
  - Book appointments with administrators
  - View, cancel, and reschedule appointments
  - Time slot management
  - Status tracking (pending, approved, rejected, completed, cancelled)

- **Email Notifications**
  - Appointment confirmation emails
  - Status update notifications
  - Cancellation confirmations
  - Password reset emails

- **Admin Dashboard**
  - Comprehensive analytics
  - Appointment management
  - Time slot configuration
  - Student directory

- **Mobile Responsive Design**
  - Works on all device sizes
  - Touch-friendly interface
  - Responsive navigation

## Technology Stack

- **Frontend**
  - React.js
  - React Router for navigation
  - Context API for state management
  - Axios for API requests
  - CSS for styling

- **Backend**
  - Node.js
  - Express.js
  - MySQL database
  - JWT for authentication
  - Nodemailer for email notifications

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/school-appointment-portal.git
cd school-appointment-portal
```

2. **Set up environment variables**

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=5001

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=appointment_system

# JWT Secret for Authentication
JWT_SECRET=your_jwt_secret_key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=School Appointment System <your-email@gmail.com>

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000
```

3. **Install backend dependencies**

```bash
cd backend
npm install
```

4. **Install frontend dependencies**

```bash
cd ../frontend
npm install
```

5. **Set up the database**

```bash
cd ../backend
node db/create-db.js
```

6. **Start the backend server**

```bash
npm run dev
```

7. **Start the frontend development server**

```bash
cd ../frontend
npm start
```

8. **Access the application**

Open your browser and navigate to `http://localhost:3000`

## API Documentation

### Authentication Endpoints

- **POST /api/auth/register**
  - Register a new user
  - Body: `{ name, email, password, student_id, department, year_level }`
  - Returns: User object and JWT token

- **POST /api/auth/login**
  - Login a user
  - Body: `{ email, password }`
  - Returns: User object and JWT token

- **GET /api/auth/user**
  - Get current user data
  - Headers: `x-auth-token`
  - Returns: User object

- **POST /api/auth/forgot-password**
  - Request password reset
  - Body: `{ email }`
  - Returns: Success message

- **GET /api/auth/reset-password/:token**
  - Verify reset token
  - Returns: Token validity status

- **POST /api/auth/reset-password/:token**
  - Reset password
  - Body: `{ password }`
  - Returns: Success message

### Appointment Endpoints

- **GET /api/appointments**
  - Get all appointments (admin) or user's appointments (student)
  - Headers: `x-auth-token`
  - Returns: Array of appointments

- **GET /api/appointments/:id**
  - Get a specific appointment
  - Headers: `x-auth-token`
  - Returns: Appointment object

- **POST /api/appointments**
  - Create a new appointment
  - Headers: `x-auth-token`
  - Body: `{ date, time_slot_id, reason }`
  - Returns: Created appointment

- **PUT /api/appointments/:id**
  - Update an appointment
  - Headers: `x-auth-token`
  - Body: `{ status, admin_notes }`
  - Returns: Success message

- **DELETE /api/appointments/:id**
  - Cancel an appointment
  - Headers: `x-auth-token`
  - Returns: Success message

### Time Slot Endpoints

- **GET /api/time-slots**
  - Get all time slots
  - Returns: Array of time slots

- **GET /api/time-slots/available**
  - Get available time slots for a specific date
  - Query: `date`
  - Returns: Array of available time slots

- **POST /api/time-slots**
  - Create a new time slot (admin only)
  - Headers: `x-auth-token`
  - Body: `{ day_of_week, start_time, end_time, max_appointments }`
  - Returns: Created time slot

- **PUT /api/time-slots/:id**
  - Update a time slot (admin only)
  - Headers: `x-auth-token`
  - Body: `{ day_of_week, start_time, end_time, max_appointments, is_available }`
  - Returns: Success message

- **DELETE /api/time-slots/:id**
  - Delete a time slot (admin only)
  - Headers: `x-auth-token`
  - Returns: Success message

### Notification Endpoints

- **POST /api/notifications/email**
  - Send an email notification
  - Headers: `x-auth-token`
  - Body: `{ type, recipient, subject, appointmentData }`
  - Returns: Success message

- **POST /api/notifications/test**
  - Test email service (admin only)
  - Headers: `x-auth-token`
  - Body: `{ email }`
  - Returns: Success message



## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)
- [JWT](https://jwt.io/)
- [Nodemailer](https://nodemailer.com/)

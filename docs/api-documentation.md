# School Appointment Portal - API Documentation

This document provides detailed information about the API endpoints available in the School Appointment Portal.

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:5001/api
```

## Authentication

Most endpoints require authentication using JSON Web Tokens (JWT). Include the token in the request header:

```
x-auth-token: <your_jwt_token>
```

## Response Format

All responses are in JSON format. Successful responses typically include:

```json
{
  "data": { ... },  // Response data
  "msg": "Success message"  // Optional success message
}
```

Error responses include:

```json
{
  "msg": "Error message",  // Error description
  "errors": [ ... ]  // Optional array of validation errors
}
```

## Authentication Endpoints

### Register User

Creates a new user account.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "student_id": "S12345",
    "department": "Computer Science",  // Optional
    "year_level": 2  // Optional
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "student_id": "S12345"
    }
  }
  ```
- **Error Response**: `400 Bad Request`
  ```json
  {
    "errors": [
      {
        "msg": "Name is required",
        "param": "name",
        "location": "body"
      }
    ]
  }
  ```

### Login User

Authenticates a user and returns a token.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "student_id": "S12345"
    }
  }
  ```
- **Error Response**: `400 Bad Request`
  ```json
  {
    "msg": "Invalid credentials"
  }
  ```

### Get Current User

Retrieves the currently authenticated user's information.

- **URL**: `/auth/user`
- **Method**: `GET`
- **Authentication**: Required
- **Success Response**: `200 OK`
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "student_id": "S12345",
    "department": "Computer Science",
    "year_level": 2
  }
  ```
- **Error Response**: `401 Unauthorized`
  ```json
  {
    "msg": "No token, authorization denied"
  }
  ```

### Forgot Password

Sends a password reset email.

- **URL**: `/auth/forgot-password`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "john@example.com"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "msg": "Password reset email sent"
  }
  ```
- **Error Response**: `404 Not Found`
  ```json
  {
    "msg": "User not found"
  }
  ```

### Verify Reset Token

Verifies if a password reset token is valid.

- **URL**: `/auth/reset-password/:token`
- **Method**: `GET`
- **Authentication**: None
- **Success Response**: `200 OK`
  ```json
  {
    "msg": "Token is valid"
  }
  ```
- **Error Response**: `400 Bad Request`
  ```json
  {
    "msg": "Invalid or expired reset token"
  }
  ```

### Reset Password

Resets a user's password using a valid token.

- **URL**: `/auth/reset-password/:token`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "password": "newpassword123"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "msg": "Password has been reset successfully"
  }
  ```
- **Error Response**: `400 Bad Request`
  ```json
  {
    "msg": "Invalid or expired reset token"
  }
  ```

## Appointment Endpoints

### Get Appointments

Retrieves appointments based on user role.

- **URL**: `/appointments`
- **Method**: `GET`
- **Authentication**: Required
- **Query Parameters**:
  - `status`: Filter by status (optional)
  - `date`: Filter by date (optional)
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "student_id": "S12345",
      "student_name": "John Doe",
      "date": "2023-05-15",
      "start_time": "10:00:00",
      "end_time": "11:00:00",
      "reason": "Academic advising",
      "status": "pending",
      "admin_notes": null,
      "created_at": "2023-05-10T14:30:00Z"
    }
  ]
  ```

### Get Appointment by ID

Retrieves a specific appointment.

- **URL**: `/appointments/:id`
- **Method**: `GET`
- **Authentication**: Required
- **Success Response**: `200 OK`
  ```json
  {
    "id": 1,
    "student_id": "S12345",
    "student_name": "John Doe",
    "date": "2023-05-15",
    "start_time": "10:00:00",
    "end_time": "11:00:00",
    "reason": "Academic advising",
    "status": "pending",
    "admin_notes": null,
    "created_at": "2023-05-10T14:30:00Z"
  }
  ```
- **Error Response**: `404 Not Found`
  ```json
  {
    "msg": "Appointment not found"
  }
  ```

### Create Appointment

Creates a new appointment.

- **URL**: `/appointments`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "date": "2023-05-15",
    "time_slot_id": 1,
    "reason": "Academic advising"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": 1,
    "student_id": "S12345",
    "date": "2023-05-15",
    "time_slot_id": 1,
    "reason": "Academic advising",
    "status": "pending",
    "created_at": "2023-05-10T14:30:00Z"
  }
  ```
- **Error Response**: `400 Bad Request`
  ```json
  {
    "errors": [
      {
        "msg": "Date is required",
        "param": "date",
        "location": "body"
      }
    ]
  }
  ```

### Update Appointment

Updates an appointment's status or notes.

- **URL**: `/appointments/:id`
- **Method**: `PUT`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "status": "approved",
    "admin_notes": "Approved for academic advising"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "msg": "Appointment updated successfully"
  }
  ```
- **Error Response**: `404 Not Found`
  ```json
  {
    "msg": "Appointment not found"
  }
  ```

### Cancel Appointment

Cancels an appointment.

- **URL**: `/appointments/:id`
- **Method**: `DELETE`
- **Authentication**: Required
- **Success Response**: `200 OK`
  ```json
  {
    "msg": "Appointment cancelled successfully"
  }
  ```
- **Error Response**: `404 Not Found`
  ```json
  {
    "msg": "Appointment not found"
  }
  ```

## Time Slot Endpoints

### Get All Time Slots

Retrieves all time slots.

- **URL**: `/time-slots`
- **Method**: `GET`
- **Authentication**: None
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "day_of_week": 1,
      "start_time": "10:00:00",
      "end_time": "11:00:00",
      "max_appointments": 3,
      "is_available": true
    }
  ]
  ```

### Get Available Time Slots

Retrieves available time slots for a specific date.

- **URL**: `/time-slots/available`
- **Method**: `GET`
- **Authentication**: None
- **Query Parameters**:
  - `date`: Date to check (required)
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "day_of_week": 1,
      "start_time": "10:00:00",
      "end_time": "11:00:00",
      "max_appointments": 3,
      "is_available": true,
      "available_count": 2,
      "is_fully_booked": false
    }
  ]
  ```
- **Error Response**: `400 Bad Request`
  ```json
  {
    "msg": "Date parameter is required"
  }
  ```

### Create Time Slot

Creates a new time slot (admin only).

- **URL**: `/time-slots`
- **Method**: `POST`
- **Authentication**: Required (admin)
- **Request Body**:
  ```json
  {
    "day_of_week": 1,
    "start_time": "10:00:00",
    "end_time": "11:00:00",
    "max_appointments": 3,
    "is_available": true
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": 1,
    "day_of_week": 1,
    "start_time": "10:00:00",
    "end_time": "11:00:00",
    "max_appointments": 3,
    "is_available": true
  }
  ```
- **Error Response**: `403 Forbidden`
  ```json
  {
    "msg": "Not authorized"
  }
  ```

### Update Time Slot

Updates a time slot (admin only).

- **URL**: `/time-slots/:id`
- **Method**: `PUT`
- **Authentication**: Required (admin)
- **Request Body**:
  ```json
  {
    "max_appointments": 5,
    "is_available": false
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "msg": "Time slot updated successfully"
  }
  ```
- **Error Response**: `404 Not Found`
  ```json
  {
    "msg": "Time slot not found"
  }
  ```

### Delete Time Slot

Deletes a time slot (admin only).

- **URL**: `/time-slots/:id`
- **Method**: `DELETE`
- **Authentication**: Required (admin)
- **Success Response**: `200 OK`
  ```json
  {
    "msg": "Time slot deleted successfully"
  }
  ```
- **Error Response**: `400 Bad Request`
  ```json
  {
    "msg": "Cannot delete time slot with existing appointments"
  }
  ```

## Notification Endpoints

### Send Email Notification

Sends an email notification.

- **URL**: `/notifications/email`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "type": "appointment_confirmation",
    "recipient": "john@example.com",
    "subject": "Appointment Confirmation",
    "appointmentData": {
      "date": "2023-05-15",
      "time": "10:00 AM - 11:00 AM",
      "reason": "Academic advising"
    }
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "msg": "Notification sent successfully"
  }
  ```
- **Error Response**: `500 Internal Server Error`
  ```json
  {
    "msg": "Failed to send notification"
  }
  ```

### Test Email Service

Tests the email service (admin only).

- **URL**: `/notifications/test`
- **Method**: `POST`
- **Authentication**: Required (admin)
- **Request Body**:
  ```json
  {
    "email": "test@example.com"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "msg": "Test email sent successfully"
  }
  ```
- **Error Response**: `403 Forbidden`
  ```json
  {
    "msg": "Not authorized"
  }
  ```

## Status Codes

The API uses the following status codes:

- `200 OK`: The request was successful
- `201 Created`: A new resource was successfully created
- `400 Bad Request`: The request was invalid or cannot be served
- `401 Unauthorized`: Authentication is required and has failed or not been provided
- `403 Forbidden`: The request is valid but the server is refusing action
- `404 Not Found`: The requested resource could not be found
- `500 Internal Server Error`: An error occurred on the server

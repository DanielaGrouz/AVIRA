# 🥂✨️ AVIRA - Boutique Event Management System

**AVIRA** is a specialized backend API platform designed for organizing and managing boutique events like birthdays, bridal showers, and small social gatherings. This project serves as a robust infrastructure for event planning, focusing on clean architecture and role-based access control.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14.0.0 or higher)
- **npm** (comes with Node.js)

### Installation
1. Clone the repository or extract the project files.
2. Navigate to the project root directory in your terminal.
3. Install dependencies (as defined in `package.json`):
   ```bash
   npm install
   ```

### Running the Server
To start the development server, run:
```bash
node server.js
```

The API will be accessible at:

- Port: `3000`
- Base URL: `http://localhost:3000`
- API Base Path: `/` (All endpoints branch directly from the base URL)
---

## 🛠 Project Structure & Logic

The project follows a modular structure to ensure maintainability and separation of concerns:

- server.js – Entry point and  global middleware configuration.
- routes/ – Express route definitions.
- controllers/ – HTTP request handlers and response management.
- services/ – Core business logic and service-layer operations.
- models/ – Mock data modules and system constants.
- middleware/ – Reusable logic for Logging, Authorization, and Validation.
- utils/ – Helper utilities for AI, email, and external integrations.
- docs/ –API documentation and Postman collections.

### Key Assumptions
- **In-Memory Storage**: Data is stored in RAM and resets whenever the server restarts.
- **ID Generation**: Numeric IDs are auto-incremented based on the data array length.
- **Password Hashing**: We utilize bcrypt for password hashing.
- **Role-Based Access**: Security is simulated using the `x-user-role` request header.
- **File Uploads**: Handled via multer (e.g., uploading user profile pictures or saving event invitations). 
- **External Integrations**: Includes AI features via @huggingface/inference / groq-sdk and email functionalities via nodemailer.

---

## 📑 API Reference

### 1. Users Resource (`/users`)
User management, authorization, and authentication processes.

| Method | Endpoint | Params | Request Body Format (JSON/Form) | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/users` | None | None | Get all users in the system | Admin |
| **GET** | `/users/:id` | `:id` | None | Get a specific user by ID | No |
| **POST** | `/users` | None | `multipart/form-data`: `firstName`, `lastName`, `email`, `password`, `role`, `picture` | Create a new user and upload a profile picture | No |
| **PUT** | `/users/:id` | `:id` | `JSON`: `{ "firstName", "lastName"... }` | Update existing user details | No |
| **DELETE** | `/users/:id` | `:id` | None | Delete a user from the system | No |
| **POST** | `/users/login` | None | `JSON`: `{ "email", "password" }` | User login to receive an authentication token | No |
| **POST** | `/users/send-verification-code` | None | `JSON`: `{ "email" }` | Send an email verification code | No |
| **POST** | `/users/verify-email` | None | `JSON`: `{ "email", "code" }` | Verify email using the provided code | No |
| **POST** | `/users/reset-password` | None | `JSON`: `{ "email", "newPassword" }` | Reset a user's password | No |

---

### 2. Events Resource (`/events`)
Event management, advanced search, and AI capabilities.

| Method | Endpoint | Params | Request Body Format (JSON) | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/events` | None | None | Get all events in the system | Admin |
| **GET** | `/events/:id` | `:id` | None | Get details of a specific event | No |
| **GET** | `/events/search` | `?q=text` | None | Search for events using a free text query | No |
| **GET** | `/events/browse` | `?eventType`, `?location` | None | Filter events by type and location | No |
| **GET** | `/events/creator/:creatorId` | `:creatorId` | None | Get all events created by a specific manager | No |
| **GET** | `/events/guest/name/:name` | `:name` | None | Find events by guest's name | No |
| **GET** | `/events/guest/phone/:phone` | `:phone` | None | Find events by guest's phone number | No |
| **POST** | `/events` | None | `JSON`: `{ "creatorId", "title", "date", "location"... }` | Create a new event | No |
| **PUT** | `/events/:id` | `:id` | `JSON`: `{ "title", "date", "location"... }` | Update an existing event's details | No |
| **DELETE** | `/events/:id` | `:id` | None | Delete an event from the system | No |
| **GET** | `/events/:id/generate-invite` | `:id` | None | Generate an AI-based event invitation | No |
| **GET** | `/events/:id/shopping-list` | `:id` | None | Generate an AI-based shopping list | No |
| **GET** | `/events/:id/task-list` | `:id` | None | Generate an AI-based task list | No |
| **GET** | `/events/:id/find-stores` | `:id` | None | Find relevant stores for the event needs | No |
| **PUT** | `/events/:id/save-invitation` | `:id` | `multipart/form-data`: `picture` | Save the generated event invitation image | No |

---
### 3. Guests Sub-Resource (`/events/:id/guests`)
Manage guests specifically within the context of an event.

| Method | Endpoint | Params | Request Body Format (JSON) | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/events/:id/guests` | `:id` | None | Get all guests for a specific event | No |
| **POST** | `/events/:id/guests` | `:id` | `JSON`: `{ "name", "phone", "role" }` | Add a new guest to an event | No |
| **PUT** | `/events/:id/guests/:guestId` | `:id`, `:guestId` | `JSON`: `{ "name", "phone", "role" }` | Update guest details within an event | No |
| **PATCH** | `/events/:id/guests/:guestId/rsvp` | `:id`, `:guestId` | `JSON`: `{ "status" }` | Update guest's RSVP status | No |
| **DELETE** | `/events/:id/guests/:guestId` | `:id`, `:guestId` | None | Remove a guest from a specific event | No |

---

### 4. Tasks Sub-Resource (`/events/:id/tasks`)
Manage tasks specifically within the context of an event.

| Method | Endpoint | Params | Request Body Format (JSON) | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/events/:id/tasks` | `:id` | None | Get all tasks for a specific event | No |
| **POST** | `/events/:id/tasks` | `:id` | `JSON`: `{ "title", "priority" }` | Add a new task to an event | No |
| **PUT** | `/events/:id/tasks/:taskId` | `:id`, `:taskId` | `JSON`: `{ "title", "status" }` | Update an existing task within an event | No |
| **DELETE** | `/events/:id/tasks/:taskId` | `:id`, `:taskId` | None | Remove a task from a specific event | No |

---

### 5. Guests Resource (`/guests`)
Direct management of objects without an event context.

| Method | Endpoint | Params | Request Body Format (JSON) | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/guests` | None | None | Get all guests across the entire system | Admin |
| **GET** | `/guests/:id` | `:id` | None | Get a standalone guest by ID | No |
| **POST** | `/guests` | None | `JSON`: `{ "name", "phone", "role" }` | Create a standalone guest | No |
| **PUT** | `/guests/:id` | `:id` | `JSON`: `{ "name", "phone", "role" }` | Update a standalone guest | No |
| **DELETE** | `/guests/:id` | `:id` | None | Delete a standalone guest | No |

---

### 6. Tasks Resource (`/tasks`)
Direct management of objects without an event context.

| Method | Endpoint | Params | Request Body Format (JSON) | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/tasks` | None | None | Get all tasks across the entire system | Admin |
| **GET** | `/tasks/:id` | `:id` | None | Get a standalone task by ID | No |
| **POST** | `/tasks` | None | `JSON`: `{ "title", "priority" }` | Create a standalone task | No |
| **PUT** | `/tasks/:id` | `:id` | `JSON`: `{ "title", "status" }` | Update a standalone task | No |
| **DELETE** | `/tasks/:id` | `:id` | None | Delete a standalone task | No |

---


## 💡 Example Requests & Responses

### 🟢 Example Success Response (Create Event)

**Request:** `POST /events`

**Body:**
```json
{
  "creatorId": 1,
  "title": "Summer Rooftop Party",
  "date": "2026-08-15",
  "time": "21:00",
  "location": "Tel Aviv",
  "eventType": "Party",
  "guestsCount": 0
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "eventId": 111,
    "creatorId": 1,
    "title": "Summer Rooftop Party",
    "date": "2026-08-15",
    "time": "21:00",
    "location": "Tel Aviv",
    "eventType": "Party",
    "guestsCount": 0
  },
  "error": null
}
```

### 🔴 Example Error Response (Not Found)

**Request:** `GET /events/999`

**Response (404 Not Found):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Event with ID 999 was not found.",
    "details": {}
  }
}
```
---

## 🧪 Testing with Postman

To test the API effectively:
1. Open **Postman**.
2. Import the collection file located in `/docs/AVIRA_API_Collection.json`.
3. The collection is organized by folders for each resource.
4. Set the request headers for protected routes where necessary:
    - Key: `x-user-role`
    - Value: `admin` (or `manager` / `user`)

---

## ⚠️ Important Notes for Testing

### Environment Variables (`.env` File)
This project utilizes environment variables to securely manage sensitive information, such as AI API keys (HuggingFace/Groq), and email service credentials.
Normally, the `.env` file is excluded from version control (via `.gitignore`) for security purposes and will not appear in the GitHub repository. However, **we have explicitly included the `.env` file in our submitted project folder** so that you can run, test, and evaluate the system immediately without needing to set up your own API keys or configurations.

### Testing the Email Verification Flow
Please note that the email verification endpoints (`/users/send-verification-code` and `/users/verify-email`) rely on a live email integration using `nodemailer`.
Because the system sends a real, dynamically generated code to the provided address, **this flow cannot be tested using mock or fake email addresses**. To successfully test the verification process, you must use a real, accessible email address in the request body to receive the code and complete the verification.

---
## ✒️ Author

**Daniela Grouz & Rinat Hadad**

3rd Year Information Systems and Software Engineering Students  
Ben-Gurion University

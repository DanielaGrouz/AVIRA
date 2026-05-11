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
3. Install dependencies:
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
- **Role-Based Access**: Security is simulated using the `x-user-role` request header.

---

## 📑 API Reference

### 1. Users Resource

| Method | Endpoint    | Description                  | Auth Required |
|--------|------------|------------------------------|--------------|
| GET    | /users     | Get all users                | No           |
| GET    | /users/:id | Get user by ID              | No           |
| POST   | /users     | Create user                 | Admin/Manager|
| PUT    | /users/:id | Update user                 | Admin/Manager|
| DELETE | /users/:id | Delete user                 | Admin        |


### 2. Events Resource

| Method | Endpoint             | Description               | Query Params                     |
|--------|---------------------|---------------------------|----------------------------------|
| GET    | /events/search      | Search events             | ?q=text                          |
| GET    | /events/browse      | Filter events             | eventType, location              |
| GET    | /events/creator/:id | Events by manager         | None                             |
| GET    | /events             | Get all (paginated)       | page, limit, sortBy              |
| GET    | /events/:id         | Get event by ID           | None                             |
| POST   | /events             | Create event              | Manager                          |
| PUT    | /events/:id         | Update event              | Manager                          |
| DELETE | /events/:id         | Delete event              | Admin/Manager                    |


### 3. Guests (Event Sub-resources)

| Method | Endpoint                         | Description        | Body             |
|--------|----------------------------------|--------------------|------------------|
| GET    | /events/:id/guests              | Get guests         | None             |
| POST   | /events/:id/guests              | Add guest          | name, phone, role|
| DELETE | /events/:id/guests/:gId         | Delete guest       | None             |
| PATCH  | /events/:id/guests/:gId/rsvp    | Update RSVP        | status           |


### 4. Tasks (Event Sub-resources)

| Method | Endpoint                         | Description        | Body             |
|--------|----------------------------------|--------------------|------------------|
| GET    | /events/:id/tasks               | Get tasks          | None             |
| POST   | /events/:id/tasks               | Add task           | title, priority  |
| PUT    | /events/:id/tasks/:tId          | Update task        | status, title    |

---


### Example Requests & Responses

**Endpoint:** `POST /users`  
**Headers:** `x-user-role: admin`  
**Body (JSON):**
```json
{
  "firstName": "Yosef",
  "lastName": "Cohen",
  "userRole": "manager"
}
```

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
## ✒️ Author

**Daniela Grouz & Rinat Hadad**

3rd Year Information Systems and Software Engineering Students  
Ben-Gurion University

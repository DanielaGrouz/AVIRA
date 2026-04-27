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
The API will be accessible at: `http://localhost:3000`

---

## 🛠 Project Structure & Logic

The project follows a modular structure to ensure maintainability and separation of concerns:

- **`server.js`**: Application entry point and global middleware configuration.
- **`routes/`**: Route definitions using Express Router.
- **`controllers/`**: Request handlers and business logic.
- **`models/`**: Mock data modules and system constants.
- **`middleware/`**: Reusable logic for Logging, Authorization, and Validation.
- **`docs/`**: API documentation and Postman collections.

### Key Assumptions
- **In-Memory Storage**: Data is stored in RAM and resets whenever the server restarts.
- **ID Generation**: Numeric IDs are auto-incremented based on the data array length.
- **Role-Based Access**: Security is simulated using the `x-user-role` request header.

---

## 📑 API Reference (Users Resource)

| Method | Endpoint | Description | Auth Required |
|:--- |:--- |:--- |:--- |
| **GET** | `/users` | Get all registered users | No |
| **GET** | `/users/:id` | Get a specific user by ID | No |
| **POST** | `/users` | Create a new user | Admin/Manager |
| **PUT** | `/users/:id` | Update an existing user | Admin/Manager |
| **DELETE** | `/users/:id` | Remove a user from the system | Admin |

### Request Example (Create User)
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

## 🧪 Testing with Postman

To test the API effectively:
1. Open **Postman**.
2. Import the collection file located in `/docs/AVIRA_API_Collection.json`.
3. Set the request headers for protected routes:
   - Key: `x-user-role`
   - Value: `admin` (or `manager` / `user`)

### Example Responses
- **Success (201 Created):**
  ```json
  { "success": true, "data": { "userId": 3 }, "error": null }
  ```
- **Error (403 Forbidden):**
  ```json
  { "success": false, "data": null, "error": { "code": "FORBIDDEN", "message": "..." } }
  ```

---

## ✒️ Author
**Daniela** *Information Systems Engineering Student - Ben-Gurion University*
```

### למה הקובץ הזה מצוין ל-GitHub?
1. **טבלאות:** השתמשתי בטבלה עבור ה-API Reference, מה שהופך את זה לקריא מאוד.
2. **סימון קוד:** קטעי הקוד צבועים (Syntax Highlighting) לפי שפת Javascript/JSON.
3. **Emojis:** האיקונים מוסיפים צבע וסדר ויזואלי.
4. **מבנה היררכי:** שימוש ב-`#` ו-`##` יוצר תוכן עניינים אוטומטי ב-GitHub וב-PyCharm.

**טיפ קטן:** כשאת פותחת את הקובץ ב-PyCharm, תראי בצד ימין למעלה כפתור קטן של **Preview** (סמל של דף עם זכוכית מגדלת). לחיצה עליו תראה לך בדיוק איך זה יוצג ב-GitHub!
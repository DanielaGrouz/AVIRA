# 🥂✨️ AVIRA - Boutique Event Management System

**AVIRA** is a specialized frontend web application designed for organizing and managing boutique events like birthdays, bridal showers, and small social gatherings. This React-based interface provides an elegant, user-friendly experience, focusing on clean UI architecture, protected routing, and seamless integration with the AVIRA backend API.

---

## 🚀 Getting Started - How to Run

### Prerequisites
- **Node.js** (v14.0.0 or higher)
- **npm** (comes with Node.js)
- **Backend Server**: Ensure the AVIRA backend server is currently running before operating the frontend.
    ```bash
    node server.js
    ```

### Installation
Navigate to the frontend project directory in your terminal and install all required packages by running:
```bash
npm install
```

### Start the Development Server
Once the installation is complete, run the following command to start the React application:
```bash
npm start
```
The application will automatically open in your default browser at http://localhost:5000.

---

## 🔗 API Base URL

The frontend application relies on the backend API to function correctly and fetch data. All client-side services (e.g., API requests made from `src/services/`) are explicitly configured to communicate with the backend server at the following target address:

**Target URL:** `http://localhost:3000`

*(Note: While the React frontend runs on port 5000, all data requests are routed to this backend API on port 3000).*

---

## ✨ Key Features & Screens

AVIRA provides a seamless and secure interface built around the following core features:

- **Secure Authentication System:** Access to the platform is protected, requiring users to log in. The system includes a full registration flow with secure email verification, as well as a complete password reset process for account recovery.
- **Centralized Dashboard:** The main hub of the application where authenticated users can view, manage, and organize all boutique events (such as birthdays, bridal showers, and dinners) in one clean interface.
- **AI-Powered Event Tools:** Elevate the planning experience with built-in artificial intelligence integrations. The system can automatically generate custom event invitations and intelligently suggest relevant local stores based on the event's specific task lists.
- **Profile Settings:** A dedicated configuration page allowing users to update their personal information. This includes a custom **Profile Image Uploader** that enables users to seamlessly upload a new photo, updating the UI instantly.

---

## 🛠 Project Structure & Logic

The project follows a modular structure to ensure maintainability and a seamless user experience:

- **src/components/** – Reusable UI elements (Buttons, InputFields, ProfileImageUploader, Navbar).
- **src/pages/** – Main application views (Login, Signup, ResetPassword, Settings, Dashboard).
- **src/services/** – API communication layer (e.g., UserService.js) handling HTTP requests to the backend.
- **src/hooks/** – Custom React hooks (e.g., useAuth) for global state management and session persistence.
- **src/styles/** – Global CSS and component-specific stylesheets maintaining the system's pastel luxury aesthetic.

---

## ✒️ Author

**Daniela Grouz & Rinat Hadad**

3rd Year Information Systems and Software Engineering Students  
Ben-Gurion University

# 🥂✨️ AVIRA - Boutique Event Management System

**AVIRA** is a specialized frontend web application designed for organizing and managing boutique events like birthdays, bridal showers, and small social gatherings. This React-based interface provides an elegant, user-friendly experience, focusing on clean UI architecture, protected routing, and seamless integration with the AVIRA backend API.

---

## 🚀 Getting Started - How to Run

### Prerequisites
- **Node.js** (v14.0.0 or higher)
- **npm** (comes with Node.js)
- **Backend Server**: Ensure the AVIRA backend server is currently running before operating the frontend, by running:
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
The application will automatically open in your default browser at http://localhost:5173.
* Note: The React frontend application runs on port 5173, while all internal client-side API requests are routed to the backend server running at http://localhost:3000.

---

## ✨ Key Features & Screens

AVIRA provides a seamless, secure, and feature-rich interface built around the following core modules:

1. **Authentication & Security:**
   * Login & Registration: Secure entry points with strict frontend and backend input validation.
   * OTP Verification: A complete email verification flow requiring a 4-digit code sent via email. 
   * Password Recovery: A robust "Forgot Password" and "Reset Password" flow.
   * Role-Based Access Control: Protected routes ensure that only authenticated users can access protected pages, and only Admins can access management tools.
   * JWT Session Management: Secure, stateless user sessions managed via JSON Web Tokens, automatically attached to all outgoing API requests using centralized Axios interceptors.
2. **Event Management:**
   * My Events Grid: A styled grid displaying all user events with dynamic date badges, guest counts, and embedded Google Maps for locations.
   * Search & Sort: Real-time filtering and sorting of events by title, date, or location.
   * Calendar Integration: A built-in "Add to Calendar" button that generates a Google Calendar event with pre-filled details.
   * Admin-Only Permissions: View and edit all events in the system.
3. **Event Operations & Data Tables:**
   * Guest List Table: A dynamic Data Table component for managing attendees, featuring inline editing, deletion, and RSVP status tracking (Pending/Confirmed/Cancelled).
   * WhatsApp RSVP Integration: With a single click, event managers can generate and send a personalized WhatsApp message to a guest containing a dynamic, unique RSVP landing page link.
   * Task Management: An interactive checklist for event-related tasks, categorized by priority and status.
4. **Smart AI Integrations:**
   * AI Invitations: Automatically generate customized image invitations based on the event's theme and details, which can be downloaded or saved to the dashboard. 
   * AI Task Generation: Intelligently generate a recommended checklist of action items and preparations tailored specifically to the event type.
   * AI Shopping Lists: Automatically compile relevant shopping items and supply lists needed to make the event a success.
   * Location-Based Store Finder: Utilizes Google Maps to find and display nearby stores relevant to the specific tasks required for the event.
5. **Profile Settings & User Management:**
   * Personal Account Management: A dedicated configuration page allowing users to update their personal information, phone numbers, and upload a custom profile picture.
   * Admin User Management: Seamlessly integrated into the settings page, Administrators have access to a secure dashboard portal to monitor, edit, or remove registered users across the platform.
6. **System Errors:**
   * Global Error Handling: user-friendly fallback screens designed to elegantly handle 404 (Not Found), 403 (Access Denied), and 500 (Internal Server Error) scenarios, ensuring a seamless experience even during network failures.
   * Dynamic UI Feedback: Real-time error messages displayed directly within forms and modals, accurately reflecting specific validation failures (e.g. invalid dates) to guide the user seamlessly.

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

# 🥂✨️ AVIRA - Boutique Event Management System

**AVIRA**  is a full-stack boutique event management platform designed to organize and manage personal events such as birthdays, bridal showers, and social gatherings. The system provides tools for event planning, guest management, real-time collaboration, and AI automation.

---

## 🚀 Getting Started - How to Run

### Prerequisites
- **Node.js** (v14.0.0 or higher)
- **npm** (comes with Node.js)
- **Docker Desktop** (make sure it is open and running on your computer)

### Environment Variables
- PORT=3000
- DB_HOST=localhost
- DB_USER=username
- DB_PASS=password
- DB_NAME=avira_db
- DB_PORT=3307
- JWT_SECRET=**your_secret_key**
- GROQ_API_KEY=**your_groq_key**
- HF_TOKEN=**your_huggingface_token**
- GMAIL_PASSWORD=**your_gmail_app_password**
- GOOGLE_API_KEY=**your_google_maps_key**

### Installation
**Step 0 - Database Infrastructure:**
1. Open your terminal in the root folder of the project.
2. Start the database container:
    ```bash
    cd backend
    docker-compose up -d
    ```

**Step 1 - Backend Setup & Seeding:**
1. While in the backend folder, install dependencies:
    ```bash
    npm install
    ```
2. Navigate to the backend migrations folder:
    ```bash
    cd backend/migrations
    ```
3. Run the seed script to initialize the database:
    ```bash
    node seed.js
    ```

**Step 2 - Running the Backend:**
1. Navigate back to the backend source folder:
    ```bash
    cd ../src
    ```
2. Start the server:
    ```bash
    node server.js
    ```
* The API will be available at http://localhost:3000.

**Step 3 - Running the Frontend:**
1. Open a **new** terminal window (keep the backend terminal running).
2. Navigate to the frontend source folder:
    ```bash
    cd frontend
    ```
3. Install dependencies:
    ```bash
    npm install
    ```
4. Start the frontend:
    ```bash
    npm start
    ```
* The application will automatically open at http://localhost:5173.

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
4. **Real-Time Communication (WebSocket):**
    * Live Gallery Synchronization: Instant broadcast of photo uploads from guests to the event manager's live gallery dashboard using Socket.IO.
    * Live RSVP Updates: Real-time attendance status synchronization, providing the event manager with immediate visual feedback when guests confirm or decline invitations.
5. **Smart AI Integrations:**
    * AI Invitations: Automatically generate customized image invitations based on the event's theme and details, which can be downloaded or saved to the dashboard.
    * AI Task Generation: Intelligently generate a recommended checklist of action items and preparations tailored specifically to the event type.
    * AI Shopping Lists: Automatically compile relevant shopping items and supply lists needed to make the event a success.
    * Location-Based Store Finder: Utilizes Google Maps to find and display nearby stores relevant to the specific tasks required for the event.
6. **Profile Settings & User Management:**
    * Personal Account Management: A dedicated configuration page allowing users to update their personal information, phone numbers, and upload a custom profile picture.
    * Admin User Management: Seamlessly integrated into the settings page, Administrators have access to a secure dashboard portal to monitor, edit, or remove registered users across the platform.
7. **Backend and Database Infrastructure:**
    * ORM Architecture: Robust data modeling using Sequelize ORM, enabling complex relational queries (JOINs, Eager Loading) and strict data integrity across the system.
    * Automated Seeding: Professional database initialization and seeding scripts that programmatically recreate the database state with mock data for rapid testing and development
8. **System Errors:**
    * Global Error Handling: user-friendly fallback screens designed to elegantly handle 404 (Not Found), 403 (Access Denied), and 500 (Internal Server Error) scenarios, ensuring a seamless experience even during network failures.
    * Dynamic UI Feedback: Real-time error messages displayed directly within forms and modals, accurately reflecting specific validation failures (e.g. invalid dates) to guide the user seamlessly.
---

## 🔗 Client-Side Routing & Endpoints

Below is an overview of the system's API endpoints. In addition, detailed Postman collection is available at /backend/docs/AVIRA_API_Collection.json
* **Authentication Routes (Public):**
   * `/login` - User authentication and session creation.
   * `/signup` - New user registration.
   * `/verify-email` - OTP verification portal (requires email URL parameter).
   * `/forgot-password` - Trigger password reset emails.
   * `/reset-password` - Set a new password securely.
   * `/rsvp/:token` - Dynamic landing page for guests to confirm attendance and access the live gallery via an encrypted token.

* **Core Application Routes (Protected - Requires Authentication):**
   * `/` (Home) - The main dashboard displaying the user's event grid.
   * `/settings` - Profile configuration and account management.
   * `/events/create` - Interactive form to generate a new event.
   * `/events/:id` - The main management hub for a specific event (Tasks, Guests, AI actions).
   * `/events/:id/gallery` - The Live WebSocket-powered photo gallery for an event.

* **Administrator Routes (Protected - Requires Admin Role):**
   * `/admin-users` - Global user management dashboard.

* **Error Fallback Routes:**
   * `/not-found` - 404 Error page for invalid URLs.
   * `/unauthorized` - 403 Error page for insufficient permissions.
   * `/server-error` - 500 Error page for critical backend failures.

---

## 🛠 Project Architecture

The project follows a modular structure to ensure maintainability and a seamless user experience:
- Backend: Node.js & Express API, utilizing Sequelize ORM for database interactions, Socket.IO for real-time features, and bcrypt/JWT for security.
- Frontend: React-based SPA with React Router for protected routing, Axios for API communication, and CSS for a boutique-style aesthetic.
- Database: MySQL (Containerized via Docker).

---

## ⚠️ Known Limitations

- Email Verification: Verification requires a real email address as it utilizes a live SMTP service (nodemailer).
- Environment Configuration: API keys for AI services are embedded for evaluation purposes; in a production environment, these managed via .env files kept out of version control.
- External API Dependencies: Some features rely on third-party services such as AI providers, Google Maps, and WhatsApp-related integrations. Their availability and behavior depend on external API limits, credentials, and network connectivity.
- Environment Variables: The application requires correct environment variables to run properly. Missing or invalid values may prevent certain features from working as expected.
- Postman Collection Token Authentication: The Postman collection provided in the backend requires a valid authentication token to execute requests. To facilitate testing without active credentials, pre-configured examples with mock responses have been saved within the collection.

---

## 📦 Submission Artifacts Index

* **Frontend Source Code:** Located in the `/frontend` directory.
* **Backend Source Code:** Located in the `/backend/src` directory.
* **ORM Models:** Defined within `/backend/src/models/index.js`.
* **Migrations Files:** Database initialization and seeding scripts are located in the `/backend/migrations/` folder (run via `seed.js`).
* **README.md:** You are currently reading it (Root directory).
* **.env.example:** A template environment file is provided in the ZIP archive. To run the application, configure your credentials and save it as `.env` inside the `/backend/src/` folder.
* **Postman Collection:** The complete API documentation and test requests are located at `/backend/docs/AVIRA_API_Collection.json`.
* **System Screenshots:** A comprehensive PDF document named `Assignment 4 - System Screenshots.pdf` is included in the ZIP archive.
* **Demo Video:** A full system walkthrough video named `AVIRA_Demo_Video.mp4` is included directly in the ZIP archive.

---

---

## ✒️ Author

**Daniela Grouz & Rinat Hadad**

3rd Year Information Systems and Software Engineering Students  
Ben-Gurion University

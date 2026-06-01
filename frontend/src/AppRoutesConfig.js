export default class AppRoutes {
    // Auth Routes
    static LOGIN = '/login';
    static SIGNUP = '/signup';
    static FORGOT_PASSWORD = '/forgot-password';
    static VERIFY_EMAIL = '/verify-email';
    static RESET_PASSWORD = '/reset-password';

    // Main Routes
    static HOME = '/';
    static SETTINGS = '/settings';
    static ADMIN_MANAGE_USERS = '/admin-users';

    // Dynamic Route Definitions (used in <Route path={...} />)
    static EVENT_DETAILS = '/events/:id';
    static RSVP = '/rsvp/:eventId/:title/:date/:time/:location/:guestId';

    // Route Generators (used for navigation, e.g., navigate(AppRoutes.getEventDetails(5)))
    static getEventDetails(id) {
        return `/events/${id}`;
    }
    static CREATE_EVENT = "/events/create";
    static NOT_FOUND = "/not-found";

}
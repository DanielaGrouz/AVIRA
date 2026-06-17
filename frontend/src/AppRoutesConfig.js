export default class AppRoutes {
  static LOGIN = '/login';
  static SIGNUP = '/signup';
  static FORGOT_PASSWORD = '/forgot-password';
  static VERIFY_EMAIL = '/verify-email';
  static RESET_PASSWORD = '/reset-password';

  static HOME = '/';
  static SETTINGS = '/settings';
  static ADMIN_MANAGE_USERS = '/admin-users';

  static EVENT_DETAILS = '/events/:id';
  static RSVP = '/rsvp/:token';

  static getEventDetails(id) {
    return `/events/${id}`;
  }

  static getEventGallery(id) {
    return `/events/${id}/gallery`;
  }
  static CREATE_EVENT = '/events/create';
  static LIVE_GALLERY = '/events/:id/gallery';
  static NOT_FOUND = '/not-found';
  static UNAUTHORIZED = '/unauthorized';
  static SERVER_ERROR = '/server-error';
}

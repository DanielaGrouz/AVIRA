const { z } = require('zod');
const { VALID_ROLES } = require('../../models/constants');

// --- Reusable Regex Patterns ---
const phoneRegex = /^05\d-?\d{7}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

// --- Parameter Schemas (req.params) ---
const idSchema = z.object({
  id: z.coerce.number().int().positive('ID must be a positive number'),
});

const idAndGuestIdSchema = z.object({
  id: z.coerce.number().int().positive(),
  guestId: z.coerce.number().int().positive(),
});

const idAndTaskIdSchema = z.object({
  id: z.coerce.number().int().positive(),
  taskId: z.coerce.number().int().positive(),
});

const tokenParamSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

// --- Query String Schemas (req.query) ---
const locationQuerySchema = z.object({
  lat: z.coerce.number({ invalid_type_error: 'Latitude must be a number' }),
  lon: z.coerce.number({ invalid_type_error: 'Longitude must be a number' }),
});

// --- Body Schemas (req.body) ---

// User Schemas
const userSchema = z.object({
  firstName: z.string().min(2, 'firstName must be at least 2 chars'),
  lastName: z.string().min(2, 'lastName must be at least 2 chars'),
  userRole: z.enum(VALID_ROLES).optional(),
  password: z.string().min(6, 'password must be at least 6 characters'),
  email: z.string().email('A valid email address is required'),
  phoneNumber: z.string().regex(phoneRegex, 'A valid Israeli phone number is required'),
});

const optionalUserSchema = userSchema.partial().extend({
  picture: z.string().optional(),
});

// Auth & Verification Schemas
const loginSchema = z.object({
  email: z.string().email('A valid email address is required'),
  password: z.string().min(1, 'Password is required'),
});

const emailSchema = z.object({
  email: z.string().email('A valid email address is required'),
});

const verifyEmailSchema = emailSchema.extend({
  code: z.string().regex(/^\d{4}$/, 'Verification code must be exactly 4 digits'),
});

const resetPasswordSchema = verifyEmailSchema.extend({
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// Guest Schemas
const guestSchema = z.object({
  name: z.string().min(2, 'name must be at least 2 chars'),
  phone: z.string().regex(phoneRegex, 'A valid Israeli phone number is required'),
  status: z.enum(['confirmed', 'pending', 'cancelled']).optional(),
});

const rsvpBodySchema = z.object({
  token: z.string().min(1, 'Token is required'),
  status: z.enum(['confirmed', 'pending', 'cancelled']),
});

// Task Schemas
const taskSchema = z.object({
  title: z.string().min(2, 'title must be at least 2 chars'),
  status: z
    .enum(['pending', 'in-progress', 'completed', 'cancelled'])
    .optional()
    .default('pending'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
});

const optionalTaskSchema = taskSchema.partial();

// Event Schemas
const eventSchema = z
  .object({
    title: z.string().min(2, 'title must be at least 2 chars'),
    date: z.string().regex(dateRegex, 'date must be in YYYY-MM-DD format'),
    time: z.string().regex(timeRegex, 'time must be in HH:MM format').optional(),
    location: z.string().min(2, 'location must be at least 2 chars'),
    eventType: z.string().min(2, 'eventType must be at least 2 chars'),
    guestsCount: z.coerce.number().int().nonnegative().default(0),
  })
  .refine(
    (data) => {
      const timeString = data.time && data.time !== 'TBD' ? data.time : '00:00';
      const eventDateTime = new Date(`${data.date}T${timeString}`);
      return eventDateTime > new Date();
    },
    {
      message: 'date and time must be in the future',
      path: ['date'],
    }
  );

const optionalEventSchema = eventSchema.partial();

const basePaginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(5),
  sortDirection: z.coerce
    .number()
    .int()
    .refine((val) => val === 1 || val === -1, {
      message: 'sortDirection must be exactly 1 (ASC) or -1 (DESC)',
    })
    .optional()
    .default(-1),
});

const eventPaginationSchema = basePaginationSchema.extend({
  sortBy: z.string().optional().default('eventId'),
  searchQuery: z.string().optional().nullable(),
});

// 3. Extend it for Tasks specifically (Defaults sortBy to 'taskId')
const taskPaginationSchema = basePaginationSchema.extend({
  sortBy: z.string().optional().default('taskId'),
  searchQuery: z.string().optional().nullable(),
});

const guestPaginationSchema = basePaginationSchema.extend({
  sortBy: z.string().optional().default('guestId'),
  searchQuery: z.string().optional().nullable(),
});

const userPaginationSchema = basePaginationSchema.extend({
  sortBy: z.string().optional().default('userId'),
  searchQuery: z.string().optional().nullable(),
});

const galleryPaginationSchema = basePaginationSchema.extend({
  sortBy: z.string().optional().default('createDate'),
});

module.exports = {
  idSchema,
  idAndGuestIdSchema,
  idAndTaskIdSchema,
  tokenParamSchema,
  locationQuerySchema,
  userSchema,
  optionalUserSchema,
  loginSchema,
  emailSchema,
  verifyEmailSchema,
  resetPasswordSchema,
  guestSchema,
  rsvpBodySchema,
  taskSchema,
  optionalTaskSchema,
  eventSchema,
  optionalEventSchema,
  eventPaginationSchema,
  taskPaginationSchema,
  guestPaginationSchema,
  userPaginationSchema,
  galleryPaginationSchema,
};

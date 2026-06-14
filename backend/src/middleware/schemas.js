// // validations/schemas.js
// const { z } = require('zod');
// const { VALID_ROLES } = require('../../models/constants');
//
// // --- Reusable Regex Patterns ---
// const phoneRegex = /^05\d-?\d{7}$/;
// const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
// const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
//
// // 1. ID Parameter Validation
// const idSchema = z.object({
//     id: z.coerce.number().int().positive("ID must be a positive number")
// });
//
// // 2. User Validation
// const userSchema = z.object({
//     firstName: z.string().min(2, "firstName must be at least 2 chars"),
//     lastName: z.string().min(2, "lastName must be at least 2 chars"),
//     userRole: z.enum(VALID_ROLES, { message: `userRole must be one of: ${VALID_ROLES.join(', ')}` }).optional(),
//     password: z.string().min(6, "password must be at least 6 characters"),
//     email: z.string().email("A valid email address is required"),
//     phoneNumber: z.string().regex(phoneRegex, "A valid Israeli phone number is required")
// });
//
// // For updates, Zod's .partial() makes all fields optional automatically!
// const optionalUserSchema = userSchema.partial().extend({
//     picture: z.string().optional()
// });
//
// // 3. Guest Validation
// const guestSchema = z.object({
//     name: z.string().min(2, "name must be at least 2 chars"),
//     phone: z.string().regex(phoneRegex, "A valid Israeli phone number is required"),
//     status: z.enum(['confirmed', 'pending', 'cancelled']).optional()
// });
//
// // 4. Task Validation
// const taskSchema = z.object({
//     title: z.string().min(2, "title must be at least 2 chars"),
//     status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']).optional(),
//     priority: z.enum(['low', 'medium', 'high']).optional()
// });
//
// // 5. Event Validation
// const eventSchema = z.object({
//     title: z.string().min(2, "title must be at least 2 chars"),
//     date: z.string().regex(dateRegex, "date must be in YYYY-MM-DD format"),
//     time: z.string().regex(timeRegex, "time must be in HH:MM format").optional(),
//     location: z.string().min(2, "location must be at least 2 chars"),
//     eventType: z.string().min(2, "eventType must be at least 2 chars"),
//     guestsCount: z.number().int().nonnegative().default(0)
// }).refine(data => {
//     // Custom logic: Ensure date/time is in the future
//     const timeString = data.time && data.time !== 'TBD' ? data.time : "00:00";
//     const eventDateTime = new Date(`${data.date}T${timeString}`);
//     return eventDateTime > new Date();
// }, {
//     message: "date and time must be in the future",
//     path: ["date"]
// });
//
// const optionalEventSchema = eventSchema.partial();
//
// // 6. Verification Code Validation
// const verificationCodeSchema = z.object({
//     code: z.string().regex(/^\d{4}$/, "Verification code must be exactly 4 digits")
// });
//
// module.exports = {
//     idSchema, userSchema, optionalUserSchema, guestSchema,
//     taskSchema, eventSchema, optionalEventSchema, verificationCodeSchema
// };
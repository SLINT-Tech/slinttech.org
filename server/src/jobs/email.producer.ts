// Re-export the queueEmail function from the email queue module
// This provides a cleaner API for routes to import
export { queueEmail, EmailJobData, EmailType } from './email.queue.js';


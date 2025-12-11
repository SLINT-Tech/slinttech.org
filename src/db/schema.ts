import { pgTable, uuid, text, timestamp, integer, boolean, decimal, bigint, uniqueIndex, index } from 'drizzle-orm/pg-core';

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  membershipCategory: text('membership_category').notNull(),
  careerPath: text('career_path'),
  role: text('role').notNull().default('Mentee'),
  status: text('status').notNull().default('pending'),
  specialization: text('specialization'),
  contractFileUrl: text('contract_file_url'),
  membershipEnabled: boolean('membership_enabled').default(false),
  membershipAmount: decimal('membership_amount', { precision: 10, scale: 2 }).default('30.00'),
  membershipPaid: boolean('membership_paid').default(false),
  paymentReference: text('payment_reference'),
  paymentDate: timestamp('payment_date', { withTimezone: true }),
  communityLink: text('community_link'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  emailIdx: index('idx_user_profiles_email').on(table.email),
  roleIdx: index('idx_user_profiles_role').on(table.role),
  statusIdx: index('idx_user_profiles_status').on(table.status),
  membershipPaidIdx: index('idx_user_profiles_membership_paid').on(table.membershipPaid),
}));

export const mentorMenteeRelationships = pgTable('mentor_mentee_relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  mentorId: uuid('mentor_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  menteeId: uuid('mentee_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('active'),
  assignedDate: timestamp('assigned_date', { withTimezone: true }).notNull().defaultNow(),
  completionDate: timestamp('completion_date', { withTimezone: true }),
  progressPercentage: integer('progress_percentage').default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  mentorMenteeUnique: uniqueIndex('mentor_mentee_unique').on(table.mentorId, table.menteeId),
  mentorIdIdx: index('idx_mentor_mentee_relationships_mentor_id').on(table.mentorId),
  menteeIdIdx: index('idx_mentor_mentee_relationships_mentee_id').on(table.menteeId),
  statusIdx: index('idx_mentor_mentee_relationships_status').on(table.status),
}));

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  mentorId: uuid('mentor_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  duration: text('duration').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('active'),
  enrolledMenteesCount: integer('enrolled_mentees_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  mentorNameUnique: uniqueIndex('mentor_name_unique').on(table.mentorId, table.name),
  mentorIdIdx: index('idx_courses_mentor_id').on(table.mentorId),
  statusIdx: index('idx_courses_status').on(table.status),
}));

export const courseEnrollments = pgTable('course_enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  menteeId: uuid('mentee_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  enrolledAt: timestamp('enrolled_at', { withTimezone: true }).defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  progressPercentage: integer('progress_percentage').default(0),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  courseMenteeUnique: uniqueIndex('course_mentee_unique').on(table.courseId, table.menteeId),
  courseIdIdx: index('idx_course_enrollments_course_id').on(table.courseId),
  menteeIdIdx: index('idx_course_enrollments_mentee_id').on(table.menteeId),
  statusIdx: index('idx_course_enrollments_status').on(table.status),
}));

export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  mentorId: uuid('mentor_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  link: text('link').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  courseIdIdx: index('idx_lessons_course_id').on(table.courseId),
  mentorIdIdx: index('idx_lessons_mentor_id').on(table.mentorId),
  orderIndexIdx: index('idx_lessons_order_index').on(table.orderIndex),
}));

export const lessonProgress = pgTable('lesson_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  menteeId: uuid('mentee_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  completed: boolean('completed').default(false),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  lessonMenteeUnique: uniqueIndex('lesson_mentee_unique').on(table.lessonId, table.menteeId),
  lessonIdIdx: index('idx_lesson_progress_lesson_id').on(table.lessonId),
  menteeIdIdx: index('idx_lesson_progress_mentee_id').on(table.menteeId),
  completedIdx: index('idx_lesson_progress_completed').on(table.completed),
}));

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  mentorId: uuid('mentor_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  requirements: text('requirements'),
  deadline: timestamp('deadline', { withTimezone: true }),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  courseIdIdx: index('idx_tasks_course_id').on(table.courseId),
  mentorIdIdx: index('idx_tasks_mentor_id').on(table.mentorId),
  statusIdx: index('idx_tasks_status').on(table.status),
}));

export const taskSubmissions = pgTable('task_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  menteeId: uuid('mentee_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  submissionLink: text('submission_link'),
  submissionNotes: text('submission_notes'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow(),
  status: text('status').notNull().default('pending'),
  mentorFeedback: text('mentor_feedback'),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  taskMenteeUnique: uniqueIndex('task_mentee_unique').on(table.taskId, table.menteeId),
  taskIdIdx: index('idx_task_submissions_task_id').on(table.taskId),
  menteeIdIdx: index('idx_task_submissions_mentee_id').on(table.menteeId),
  statusIdx: index('idx_task_submissions_status').on(table.status),
}));

export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  mentorId: uuid('mentor_id').references(() => userProfiles.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  targetAudience: text('target_audience').notNull().default('all'),
  targetCourseId: uuid('target_course_id').references(() => courses.id, { onDelete: 'set null' }),
  priority: text('priority').notNull().default('normal'),
  published: boolean('published').default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  mentorIdIdx: index('idx_announcements_mentor_id').on(table.mentorId),
  targetAudienceIdx: index('idx_announcements_target_audience').on(table.targetAudience),
  publishedIdx: index('idx_announcements_published').on(table.published),
  targetCourseIdIdx: index('idx_announcements_target_course_id').on(table.targetCourseId),
}));

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  senderId: uuid('sender_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  recipientId: uuid('recipient_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  subject: text('subject'),
  content: text('content').notNull(),
  read: boolean('read').default(false),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  senderIdIdx: index('idx_messages_sender_id').on(table.senderId),
  recipientIdIdx: index('idx_messages_recipient_id').on(table.recipientId),
  readIdx: index('idx_messages_read').on(table.read),
}));

export const contractFiles = pgTable('contract_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileSize: bigint('file_size', { mode: 'number' }).notNull(),
  fileType: text('file_type').notNull(),
  storageProvider: text('storage_provider').notNull(),
  storageKey: text('storage_key').notNull(),
  storageBucket: text('storage_bucket').notNull(),
  storageUrl: text('storage_url'),
  uploadStatus: text('upload_status').notNull().default('pending'),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  storageProviderKeyUnique: uniqueIndex('storage_provider_key_unique').on(table.storageProvider, table.storageKey),
  userIdIdx: index('idx_contract_files_user_id').on(table.userId),
  storageKeyIdx: index('idx_contract_files_storage_key').on(table.storageKey),
  storageProviderIdx: index('idx_contract_files_storage_provider').on(table.storageProvider),
  uploadStatusIdx: index('idx_contract_files_upload_status').on(table.uploadStatus),
}));

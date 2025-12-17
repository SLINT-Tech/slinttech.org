import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { eq, ilike, or, sql, count, and, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { userProfiles, mentorMenteeRelationships } from '../db/schema.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { queueEmail } from '../jobs/email.producer.js';

const router = Router();

// POST /api/admin-get-users
router.post('/admin-get-users', verifyToken, requireRole('Admin'), asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    perPage = 10,
    search = '',
    status = 'all',
    role = 'all',
    membershipCategory = 'all'
  } = req.body;

  const offset = (page - 1) * perPage;

  const whereConditions = [];

  if (search && search.trim()) {
    whereConditions.push(
      or(
        ilike(userProfiles.fullName, `%${search.trim()}%`),
        ilike(userProfiles.email, `%${search.trim()}%`)
      )
    );
  }

  if (status !== 'all') {
    whereConditions.push(eq(userProfiles.status, status));
  }

  if (role !== 'all') {
    whereConditions.push(eq(userProfiles.role, role));
  }

  if (membershipCategory !== 'all') {
    whereConditions.push(eq(userProfiles.membershipCategory, membershipCategory));
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const usersQuery = db
    .select({
      id: userProfiles.id,
      email: userProfiles.email,
      fullName: userProfiles.fullName,
      membershipCategory: userProfiles.membershipCategory,
      careerPath: userProfiles.careerPath,
      role: userProfiles.role,
      status: userProfiles.status,
      specialization: userProfiles.specialization,
      contractFileUrl: userProfiles.contractFileUrl,
      membershipEnabled: userProfiles.membershipEnabled,
      membershipAmount: userProfiles.membershipAmount,
      membershipPaid: userProfiles.membershipPaid,
      paymentReference: userProfiles.paymentReference,
      paymentDate: userProfiles.paymentDate,
      communityLink: userProfiles.communityLink,
      createdAt: userProfiles.createdAt,
      updatedAt: userProfiles.updatedAt,
    })
    .from(userProfiles);

  if (whereClause) {
    usersQuery.where(whereClause);
  }

  const users = await usersQuery
    .orderBy(sql`${userProfiles.createdAt} DESC`)
    .limit(perPage)
    .offset(offset);

  const countQuery = db
    .select({ count: count() })
    .from(userProfiles);

  if (whereClause) {
    countQuery.where(whereClause);
  }

  const [{ count: totalCount }] = await countQuery;

  res.status(200).json({
    users,
    totalCount,
    page,
    perPage,
    totalPages: Math.ceil(totalCount / perPage)
  });
}));

// GET /api/admin-get-stats
router.get('/admin-get-stats', verifyToken, requireRole('Admin'), asyncHandler(async (req: Request, res: Response) => {
  const [totalResult] = await db
    .select({ count: count() })
    .from(userProfiles);

  const [approvedResult] = await db
    .select({ count: count() })
    .from(userProfiles)
    .where(eq(userProfiles.status, 'approved'));

  const [pendingResult] = await db
    .select({ count: count() })
    .from(userProfiles)
    .where(eq(userProfiles.status, 'pending'));

  const [rejectedResult] = await db
    .select({ count: count() })
    .from(userProfiles)
    .where(eq(userProfiles.status, 'rejected'));

  const [suspendedResult] = await db
    .select({ count: count() })
    .from(userProfiles)
    .where(eq(userProfiles.status, 'suspended'));

  const stats = {
    total: totalResult.count,
    approved: approvedResult.count,
    pending: pendingResult.count,
    rejected: rejectedResult.count,
    suspended: suspendedResult.count
  };

  res.status(200).json({ stats });
}));

// Also support POST for admin-get-stats
router.post('/admin-get-stats', verifyToken, requireRole('Admin'), asyncHandler(async (req: Request, res: Response) => {
  const [totalResult] = await db
    .select({ count: count() })
    .from(userProfiles);

  const [approvedResult] = await db
    .select({ count: count() })
    .from(userProfiles)
    .where(eq(userProfiles.status, 'approved'));

  const [pendingResult] = await db
    .select({ count: count() })
    .from(userProfiles)
    .where(eq(userProfiles.status, 'pending'));

  const [rejectedResult] = await db
    .select({ count: count() })
    .from(userProfiles)
    .where(eq(userProfiles.status, 'rejected'));

  const [suspendedResult] = await db
    .select({ count: count() })
    .from(userProfiles)
    .where(eq(userProfiles.status, 'suspended'));

  const stats = {
    total: totalResult.count,
    approved: approvedResult.count,
    pending: pendingResult.count,
    rejected: rejectedResult.count,
    suspended: suspendedResult.count
  };

  res.status(200).json({ stats });
}));

// GET /api/admin-get-mentors
router.get('/admin-get-mentors', verifyToken, requireRole('Admin'), asyncHandler(async (req: Request, res: Response) => {
  const mentors = await db
    .select({
      id: userProfiles.id,
      fullName: userProfiles.fullName,
      specialization: userProfiles.specialization,
      careerPath: userProfiles.careerPath
    })
    .from(userProfiles)
    .where(
      and(
        eq(userProfiles.role, 'Mentor'),
        eq(userProfiles.status, 'approved')
      )
    );

  const formattedMentors = mentors.map(mentor => ({
    id: mentor.id,
    full_name: mentor.fullName,
    specialization: mentor.specialization || mentor.careerPath
  }));

  res.status(200).json({ mentors: formattedMentors });
}));

// POST /api/admin-create-user
router.post('/admin-create-user', verifyToken, requireRole('Admin'), asyncHandler(async (req: Request, res: Response) => {
  const {
    fullName,
    email,
    password,
    membershipCategory,
    careerPath,
    role,
    status = 'pending',
    membershipEnabled = false,
    membershipAmount = 30
  } = req.body;

  if (!fullName || !email || !password || !membershipCategory || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  if (!['Admin', 'Mentor', 'Mentee'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  if (!['Student', 'Professional', 'Volunteer'].includes(membershipCategory)) {
    return res.status(400).json({ error: 'Invalid membership category' });
  }

  const [existingUser] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.email, email.toLowerCase()))
    .limit(1);

  if (existingUser) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [newUser] = await db
    .insert(userProfiles)
    .values({
      email: email.toLowerCase(),
      passwordHash,
      fullName,
      membershipCategory,
      careerPath: careerPath || null,
      role,
      status,
      specialization: role === 'Mentor' && careerPath ? careerPath : null,
      membershipEnabled: (role === 'Mentee' || role === 'Mentor') ? membershipEnabled : false,
      membershipAmount: membershipAmount.toString(),
      membershipPaid: false,
    })
    .returning({
      id: userProfiles.id,
      email: userProfiles.email,
      fullName: userProfiles.fullName,
      role: userProfiles.role,
      membershipCategory: userProfiles.membershipCategory,
      status: userProfiles.status,
      createdAt: userProfiles.createdAt,
    });

  res.status(201).json({
    message: 'User created successfully',
    user: newUser,
    temporaryPassword: password
  });
}));

// PUT /api/admin-update-user
router.put('/admin-update-user', verifyToken, requireRole('Admin'), asyncHandler(async (req: Request, res: Response) => {
  const {
    userId,
    fullName,
    email,
    password,
    membershipCategory,
    careerPath,
    role,
    status,
    communityLink,
    membershipEnabled,
    membershipAmount
  } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const [existingUser] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, userId))
    .limit(1);

  if (!existingUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (email && email !== existingUser.email) {
    const [emailExists] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.email, email.toLowerCase()))
      .limit(1);

    if (emailExists) {
      return res.status(400).json({ error: 'Email already exists' });
    }
  }

  const updateData: any = {
    updatedAt: new Date()
  };

  if (fullName !== undefined) updateData.fullName = fullName;
  if (email !== undefined) updateData.email = email.toLowerCase();
  if (membershipCategory !== undefined) updateData.membershipCategory = membershipCategory;
  if (careerPath !== undefined) updateData.careerPath = careerPath;
  if (role !== undefined) {
    updateData.role = role;
    updateData.specialization = role === 'Mentor' && careerPath ? careerPath : null;
  }
  if (status !== undefined) updateData.status = status;
  if (communityLink !== undefined) updateData.communityLink = communityLink;
  if (membershipEnabled !== undefined) updateData.membershipEnabled = membershipEnabled;
  if (membershipAmount !== undefined) updateData.membershipAmount = membershipAmount.toString();

  if (password) {
    const passwordHash = await bcrypt.hash(password, 10);
    updateData.passwordHash = passwordHash;
  }

  const [updatedUser] = await db
    .update(userProfiles)
    .set(updateData)
    .where(eq(userProfiles.id, userId))
    .returning({
      id: userProfiles.id,
      email: userProfiles.email,
      fullName: userProfiles.fullName,
      role: userProfiles.role,
      membershipCategory: userProfiles.membershipCategory,
      careerPath: userProfiles.careerPath,
      status: userProfiles.status,
      communityLink: userProfiles.communityLink,
      membershipEnabled: userProfiles.membershipEnabled,
      membershipAmount: userProfiles.membershipAmount,
      membershipPaid: userProfiles.membershipPaid
    });

  if (status !== undefined && status !== existingUser.status) {
    await queueEmail({
      type: 'application-status-update',
      to: { email: updatedUser.email, name: updatedUser.fullName },
      data: {
        userName: updatedUser.fullName,
        status: status
      }
    });
  }

  res.status(200).json({
    message: 'User updated successfully',
    user: updatedUser
  });
}));

// DELETE /api/admin-delete-user
router.delete('/admin-delete-user', verifyToken, requireRole('Admin'), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  if (userId === req.user!.userId) {
    return res.status(400).json({ error: 'Cannot delete yourself' });
  }

  const [user] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, userId))
    .limit(1);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  await db
    .delete(userProfiles)
    .where(eq(userProfiles.id, userId));

  res.status(200).json({
    message: 'User deleted successfully',
    deletedUser: {
      id: user.id,
      email: user.email,
      fullName: user.fullName
    }
  });
}));

// GET /api/admin-get-mentor-assignments
router.get('/admin-get-mentor-assignments', verifyToken, requireRole('Admin'), asyncHandler(async (req: Request, res: Response) => {
  const menteeId = req.query.menteeId as string;

  if (!menteeId) {
    return res.status(400).json({ error: 'Mentee ID is required' });
  }

  const relationships = await db
    .select({
      id: mentorMenteeRelationships.id,
      mentorId: mentorMenteeRelationships.mentorId,
      mentorFullName: userProfiles.fullName,
      mentorSpecialization: userProfiles.specialization,
      mentorCareerPath: userProfiles.careerPath
    })
    .from(mentorMenteeRelationships)
    .leftJoin(userProfiles, eq(mentorMenteeRelationships.mentorId, userProfiles.id))
    .where(eq(mentorMenteeRelationships.menteeId, menteeId));

  const assignments = relationships.map(rel => ({
    id: rel.id,
    mentor: rel.mentorId,
    mentorName: rel.mentorFullName || 'Unknown Mentor'
  }));

  res.status(200).json({ assignments });
}));

// PUT /api/admin-update-mentor-assignments
router.put('/admin-update-mentor-assignments', verifyToken, requireRole('Admin'), asyncHandler(async (req: Request, res: Response) => {
  const { menteeId, assignments } = req.body;

  if (!menteeId) {
    return res.status(400).json({ error: 'Mentee ID is required' });
  }

  const existingAssignments = await db
    .select({
      id: mentorMenteeRelationships.id,
      mentorId: mentorMenteeRelationships.mentorId
    })
    .from(mentorMenteeRelationships)
    .where(eq(mentorMenteeRelationships.menteeId, menteeId));

  const existingIds = existingAssignments.map(a => a.id);
  const newAssignmentIds = assignments.filter((a: any) => a.id).map((a: any) => a.id);

  const toDelete = existingIds.filter(id => !newAssignmentIds.includes(id));
  if (toDelete.length > 0) {
    await db
      .delete(mentorMenteeRelationships)
      .where(inArray(mentorMenteeRelationships.id, toDelete));
  }

  const newAssignments = assignments.filter((a: any) => !a.id);
  if (newAssignments.length > 0) {
    const assignmentsToInsert = newAssignments.map((assignment: any) => ({
      mentorId: assignment.mentor,
      menteeId: menteeId,
      status: 'active',
      progressPercentage: 0
    }));

    await db
      .insert(mentorMenteeRelationships)
      .values(assignmentsToInsert);
  }

  for (const assignment of assignments.filter((a: any) => a.id)) {
    await db
      .update(mentorMenteeRelationships)
      .set({
        mentorId: assignment.mentor,
        updatedAt: new Date()
      })
      .where(eq(mentorMenteeRelationships.id, assignment.id));
  }

  res.status(200).json({
    message: 'Mentor assignments updated successfully'
  });
}));

export default router;


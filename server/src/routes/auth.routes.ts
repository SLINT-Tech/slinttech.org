import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { userProfiles } from '../db/schema.js';
import { verifyToken, generateToken, JWTPayload } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { queueEmail } from '../jobs/email.producer.js';

const router = Router();

// Validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long' };
  }
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' };
  }
  return { valid: true };
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// POST /api/auth-signup
router.post('/auth-signup', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, fullName, membershipCategory, careerPath, specialization, role } = req.body;

  if (!email || !password || !fullName || !membershipCategory) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: 'Email, password, full name, and membership category are required'
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      error: 'Invalid email format',
      details: 'Please provide a valid email address'
    });
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({
      error: 'Invalid password',
      details: passwordValidation.error
    });
  }

  if (fullName.length < 2 || fullName.length > 100) {
    return res.status(400).json({
      error: 'Invalid full name',
      details: 'Full name must be between 2 and 100 characters'
    });
  }

  const validCategories = ['Student', 'Professional', 'Volunteer'];
  if (!validCategories.includes(membershipCategory)) {
    return res.status(400).json({
      error: 'Invalid membership category',
      details: 'Please select a valid membership category'
    });
  }

  const validRoles = ['Mentee', 'Mentor'];
  const userRole = role || 'Mentee';
  if (!validRoles.includes(userRole)) {
    return res.status(400).json({
      error: 'Invalid role',
      details: 'Role must be either Mentee or Mentor'
    });
  }

  const sanitizedEmail = sanitizeInput(email.toLowerCase());
  const sanitizedFullName = sanitizeInput(fullName);

  const existingUser = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.email, sanitizedEmail))
    .limit(1);

  if (existingUser.length > 0) {
    return res.status(409).json({
      error: 'Email already registered',
      details: 'This email is already associated with an account.'
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [newUser] = await db
    .insert(userProfiles)
    .values({
      email: sanitizedEmail,
      passwordHash,
      fullName: sanitizedFullName,
      membershipCategory,
      careerPath: careerPath ? sanitizeInput(careerPath) : null,
      specialization: specialization ? sanitizeInput(specialization) : null,
      role: userRole,
      status: 'pending',
      membershipEnabled: false,
      membershipPaid: false,
    })
    .returning();

  const appUrl = process.env.APP_URL || 'https://slinttech.netlify.app';
  const loginLink = newUser.role === 'Mentor' ? `${appUrl}/mentor/login` : `${appUrl}/login`;

  // Queue welcome email
  await queueEmail({
    type: 'account-awaiting-approval',
    to: { email: newUser.email, name: newUser.fullName },
    data: {
      userName: newUser.fullName,
      userEmail: newUser.email,
      userRole: newUser.role,
      membershipCategory: newUser.membershipCategory,
      loginLink
    }
  });

  // Queue admin notifications
  try {
    const adminUsers = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.role, 'Admin'));

    const adminNotificationData = {
      userName: newUser.fullName,
      userEmail: newUser.email,
      userRole: newUser.role,
      membershipCategory: newUser.membershipCategory,
      careerPath: newUser.careerPath || undefined,
      specialization: newUser.specialization || undefined,
      registrationDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      adminDashboardLink: `${appUrl}/admin/login`
    };

    for (const admin of adminUsers) {
      await queueEmail({
        type: 'admin-new-user-notification',
        to: { email: admin.email, name: admin.fullName },
        data: adminNotificationData
      });
    }
  } catch (adminEmailError) {
    console.error('Failed to send admin notifications:', adminEmailError);
  }

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    userId: newUser.id
  });
}));

// POST /api/auth-login (Mentee login)
router.post('/auth-login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const [user] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.role !== 'Mentee') {
    return res.status(403).json({ error: 'Please use the appropriate login page for your account type.' });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);

  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { passwordHash, ...userWithoutPassword } = user;

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  if (user.status === 'pending') {
    return res.status(403).json({
      error: 'Your account is pending approval',
      profile: userWithoutPassword,
      token
    });
  }

  if (user.status === 'rejected') {
    return res.status(403).json({
      error: 'Your account has been rejected',
      profile: userWithoutPassword
    });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({
      error: 'Your account has been suspended',
      profile: userWithoutPassword
    });
  }

  if (user.status === 'approved' && user.membershipEnabled && !user.membershipPaid) {
    return res.status(200).json({
      requiresPayment: true,
      token,
      profile: userWithoutPassword
    });
  }

  res.status(200).json({
    token,
    profile: userWithoutPassword
  });
}));

// POST /api/mentor-login
router.post('/mentor-login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const [user] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.role !== 'Mentor') {
    return res.status(403).json({ error: 'This login is for mentors only. Please use the appropriate login page.' });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);

  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { passwordHash, ...userWithoutPassword } = user;

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  if (user.status === 'pending') {
    return res.status(403).json({
      error: 'Your account is pending approval',
      profile: userWithoutPassword,
      token
    });
  }

  if (user.status === 'rejected') {
    return res.status(403).json({
      error: 'Your account has been rejected',
      profile: userWithoutPassword
    });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({
      error: 'Your account has been suspended',
      profile: userWithoutPassword
    });
  }

  if (user.status === 'approved' && user.membershipEnabled && !user.membershipPaid) {
    return res.status(200).json({
      requiresPayment: true,
      token,
      profile: userWithoutPassword
    });
  }

  res.status(200).json({
    token,
    profile: userWithoutPassword
  });
}));

// POST /api/admin-login
router.post('/admin-login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const [user] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);

  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { passwordHash, ...userWithoutPassword } = user;

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  if (user.status === 'pending') {
    return res.status(403).json({
      error: 'Your account is pending approval',
      profile: userWithoutPassword,
      token
    });
  }

  if (user.status === 'rejected') {
    return res.status(403).json({
      error: 'Your account has been rejected',
      profile: userWithoutPassword
    });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({
      error: 'Your account has been suspended',
      profile: userWithoutPassword
    });
  }

  res.status(200).json({
    token,
    profile: userWithoutPassword
  });
}));

// GET /api/auth-me
router.get('/auth-me', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const [user] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, req.user!.userId))
    .limit(1);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { passwordHash, ...userWithoutPassword } = user;

  res.status(200).json({ profile: userWithoutPassword });
}));

// POST /api/auth-change-password
router.post('/auth-change-password', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long' });
  }

  const [user] = await db
    .select({
      id: userProfiles.id,
      passwordHash: userProfiles.passwordHash
    })
    .from(userProfiles)
    .where(eq(userProfiles.id, req.user!.userId))
    .limit(1);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isValidPassword) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  await db
    .update(userProfiles)
    .set({
      passwordHash: newPasswordHash,
      updatedAt: new Date()
    })
    .where(eq(userProfiles.id, req.user!.userId));

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
}));

// POST /api/auth-update-profile
router.post('/auth-update-profile', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const { contractFileUrl } = req.body;
  // Always use the authenticated user's ID - never accept userId from request body
  const userId = req.user!.userId;

  if (!contractFileUrl) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: 'Contract file URL is required'
    });
  }

  if (!contractFileUrl.startsWith('https://')) {
    return res.status(400).json({
      error: 'Invalid contract URL',
      details: 'Contract file URL must be a secure HTTPS URL'
    });
  }

  const result = await db
    .update(userProfiles)
    .set({
      contractFileUrl,
      updatedAt: new Date()
    })
    .where(eq(userProfiles.id, userId))
    .returning();

  if (result.length === 0) {
    return res.status(404).json({
      error: 'User not found',
      details: 'Unable to find user with the provided ID'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully'
  });
}));

export default router;


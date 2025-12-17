import { Router, Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { userProfiles } from '../db/schema.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { queueEmail } from '../jobs/email.producer.js';

const router = Router();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

// Paystack API response types
interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    amount: number;
    paid_at: string;
    metadata?: {
      userId?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

// POST /api/payment-initialize
router.post('/payment-initialize', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const [user] = await db
    .select({
      id: userProfiles.id,
      email: userProfiles.email,
      fullName: userProfiles.fullName,
      role: userProfiles.role,
      status: userProfiles.status,
      membershipEnabled: userProfiles.membershipEnabled,
      membershipAmount: userProfiles.membershipAmount,
      membershipPaid: userProfiles.membershipPaid
    })
    .from(userProfiles)
    .where(eq(userProfiles.id, req.user!.userId))
    .limit(1);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.status !== 'approved') {
    return res.status(403).json({ error: 'Account not approved' });
  }

  if (!user.membershipEnabled) {
    return res.status(400).json({ error: 'Membership not required for this account' });
  }

  if (user.membershipPaid) {
    return res.status(400).json({ error: 'Membership already paid' });
  }

  const membershipAmount = parseFloat(user.membershipAmount || '30.00');

  if (membershipAmount <= 0) {
    return res.status(400).json({ error: 'Invalid membership amount' });
  }

  const paymentReference = `slint_${user.id}_${Date.now()}`;
  const amountInKobo = Math.round(membershipAmount * 100);

  res.status(200).json({
    amount: amountInKobo,
    email: user.email,
    reference: paymentReference,
    metadata: {
      userId: user.id,
      fullName: user.fullName,
      role: user.role,
      membershipType: 'One-time Membership'
    }
  });
}));

// POST /api/payment-verify
router.post('/payment-verify', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const { reference } = req.body;

  if (!reference) {
    return res.status(400).json({ error: 'Payment reference is required' });
  }

  console.log('Verifying payment with reference:', reference);

  const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!paystackResponse.ok) {
    console.error('Paystack verification failed:', paystackResponse.status);
    return res.status(400).json({ error: 'Payment verification failed' });
  }

  const paystackData = await paystackResponse.json() as PaystackVerifyResponse;

  console.log('Paystack response:', JSON.stringify(paystackData, null, 2));

  if (!paystackData.status || paystackData.data.status !== 'success') {
    return res.status(400).json({
      error: 'Payment not successful',
      paymentStatus: paystackData.data.status
    });
  }

  // SECURITY: Always use the authenticated user's ID from the JWT token.
  // Never trust userId from payment provider metadata as it could be spoofed.
  const userId = req.user!.userId;

  const [user] = await db
    .select({
      id: userProfiles.id,
      email: userProfiles.email,
      fullName: userProfiles.fullName,
      membershipPaid: userProfiles.membershipPaid,
      membershipAmount: userProfiles.membershipAmount,
      role: userProfiles.role
    })
    .from(userProfiles)
    .where(eq(userProfiles.id, userId))
    .limit(1);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.membershipPaid) {
    return res.status(200).json({
      message: 'Membership already paid',
      alreadyPaid: true
    });
  }

  const expectedAmount = parseFloat(user.membershipAmount || '30.00');
  const expectedAmountInKobo = Math.round(expectedAmount * 100);
  const actualAmountPaid = paystackData.data.amount;

  console.log('Amount verification:', {
    expectedAmount,
    expectedAmountInKobo,
    actualAmountPaid,
    userId
  });

  if (actualAmountPaid !== expectedAmountInKobo) {
    console.error('Amount mismatch:', {
      expected: expectedAmountInKobo,
      actual: actualAmountPaid,
      difference: actualAmountPaid - expectedAmountInKobo
    });
    return res.status(400).json({
      error: 'Payment amount does not match membership fee',
      expectedAmount: expectedAmount,
      paidAmount: actualAmountPaid / 100
    });
  }

  await db
    .update(userProfiles)
    .set({
      membershipPaid: true,
      paymentReference: reference,
      paymentDate: new Date(),
      updatedAt: new Date()
    })
    .where(eq(userProfiles.id, userId));

  console.log('Payment verified and membership updated for user:', userId);

  await queueEmail({
    type: 'payment-success',
    to: { email: user.email, name: user.fullName },
    data: {
      userName: user.fullName,
      paymentReference: reference,
      amount: `GHS ${(paystackData.data.amount / 100).toFixed(2)}`,
      paymentDate: new Date(paystackData.data.paid_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      dashboardLink: `${process.env.APP_URL || 'https://slinttech.netlify.app'}/${user.role.toLowerCase()}/dashboard`
    }
  });

  res.status(200).json({
    message: 'Payment verified successfully',
    paymentDetails: {
      reference: reference,
      amount: paystackData.data.amount / 100,
      paidAt: paystackData.data.paid_at
    }
  });
}));

export default router;


import type { UserProfile } from "../hooks/useAuth";

interface ProfileSource extends Partial<UserProfile> {
  full_name?: string;
  membership_category?: string;
  career_path?: string;
  membership_enabled?: boolean;
  membership_amount?: string;
  membership_paid?: boolean;
  payment_reference?: string;
  payment_date?: string;
}

// Keep the existing API aliases in one place for all three login screens.
export function toSessionProfile(profile: ProfileSource) {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName || profile.full_name,
    membershipCategory:
      profile.membershipCategory || profile.membership_category,
    careerPath: profile.careerPath || profile.career_path,
    role: profile.role,
    status: profile.status,
    specialization: profile.specialization,
    membershipEnabled: profile.membershipEnabled || profile.membership_enabled,
    membershipAmount: profile.membershipAmount || profile.membership_amount,
    membershipPaid: profile.membershipPaid || profile.membership_paid,
    paymentReference: profile.paymentReference || profile.payment_reference,
    paymentDate: profile.paymentDate || profile.payment_date,
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'student' | 'affiliate' | 'admin';
  referralCode: string;
  referredBy?: string;
  stage: number;
  subscription: 'trial' | 'active' | 'expired' | 'cancelled';
  createdAt: string;
  trialEndsAt: string;
}


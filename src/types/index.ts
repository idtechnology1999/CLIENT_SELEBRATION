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

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  price?: number; // deprecated - users pay per module now
  modules: Module[];
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  isFree: boolean;
  submodules: SubModule[];
}

export interface SubModule {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  orderIndex: number;
  videos: Video[];
}

export interface Video {
  id: string;
  submoduleId: string;
  title: string;
  videoUrl: string;
  duration: number;
  orderIndex: number;
}

export interface Subscription {
  id: string;
  userId: string;
  courseId: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  nextPaymentDate: string;
}

export interface Commission {
  id: string;
  payerId: string;
  beneficiaryId: string;
  courseId: string;
  level: number;
  amount: number;
  status: 'pending' | 'withdrawable' | 'withdrawn';
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  userId: string;
  referredUserId: string;
  level: number;
  createdAt: string;
}

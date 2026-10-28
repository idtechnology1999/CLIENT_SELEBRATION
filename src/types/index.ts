export type StageKey = 'fish' | 'dolphin' | 'shark' | 'whale';
export type Renewal = 'auto' | 'manual';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'student' | 'affiliate' | 'admin';
  referralCode: string;
  referredBy?: string;
  stage: number;                 // 0 = never paid, 1 Fish … 4 Whale
  subscription: 'trial' | 'active' | 'expired' | 'cancelled';
  createdAt?: string;
  trialEndsAt?: string;          // only while on the free trial
  paidUntil?: string;            // end of the current paid month
  paidUp: boolean;               // paid month (incl. grace period) still running
  unlockedStages: StageKey[];
  renewal: Renewal;
  autoRenewActive: boolean;      // Paystack will charge the card next month
}

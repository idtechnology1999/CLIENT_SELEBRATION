import type { Renewal, StageKey } from '../types';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SERVER_BASE = BASE.replace(/\/api$/, '');

export function fixUrl(url?: string): string | undefined {
  if (!url) return url;
  return url.replace(/^http:\/\/localhost:\d+/, SERVER_BASE);
}

const TOKEN_KEY = 'selliberation_user_token';
// Limited token for someone who bought a plan but hasn't confirmed their email yet.
// It only works on the sign-up payment/confirmation screens.
const SIGNUP_TOKEN_KEY = 'selliberation_signup_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const getSignupToken = () => localStorage.getItem(SIGNUP_TOKEN_KEY);
export const setSignupToken = (t: string) => localStorage.setItem(SIGNUP_TOKEN_KEY, t);
export const clearSignupToken = () => localStorage.removeItem(SIGNUP_TOKEN_KEY);

async function req<T>(method: string, path: string, body?: unknown, tokenOverride?: string | null): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = tokenOverride === undefined ? getToken() : tokenOverride;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({ success: false, message: `Server error (${res.status})` }));
  if (!res.ok || !data.success) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export const userAuthApi = {
  register: (name: string, email: string, phone: string, password: string, referralCode?: string) =>
    req<{ success: true; message: string }>('POST', '/user-auth/register', { name, email, phone, password, referralCode }),

  verifyEmail: (email: string, otp: string) =>
    req<{ success: true; token: string; data: any }>('POST', '/user-auth/verify-email', { email, otp }),

  // Either a normal login (token + data), or `signup` when the account still has to
  // finish paying / confirm its email.
  login: (email: string, password: string) =>
    req<{ success: true; token?: string; data?: any; signup?: { token: string; email: string; stage: string } }>('POST', '/user-auth/login', { email, password }),

  me: () =>
    req<{ success: true; data: any }>('GET', '/user-auth/me'),

  forgotPassword: (email: string) =>
    req<{ success: true; message: string }>('POST', '/user-auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    req<{ success: true; message: string }>('POST', '/user-auth/reset-password', { token, password }),
};

export type SignupState = 'paid' | 'pending' | 'failed';

// Buying a plan without an account: sign up → Paystack → confirm email.
export const signupApi = {
  registerPaid: (payload: { name: string; email: string; phone: string; password: string; referralCode?: string; stage: StageKey; renewal: Renewal }) =>
    req<{ success: true; data: { signupToken: string; authorizationUrl: string; reference: string } }>('POST', '/user-auth/register-paid', payload, null),

  status: () =>
    req<{ success: true; data: { state: SignupState; stage: string; email?: string; emailVerified?: boolean } }>('GET', '/user-auth/signup/status', undefined, getSignupToken()),

  resendCode: () =>
    req<{ success: true; message: string }>('POST', '/user-auth/signup/resend-code', undefined, getSignupToken()),

  changeEmail: (email: string) =>
    req<{ success: true; data: { email: string; signupToken: string } }>('POST', '/user-auth/signup/change-email', { email }, getSignupToken()),

  verify: (code: string) =>
    req<{ success: true; token: string; data: any }>('POST', '/user-auth/signup/verify', { code }, getSignupToken()),
};

export const paymentApi = {
  verifyAccount: (accountNumber: string, bankCode: string) =>
    req<{ success: true; data: { account_name: string; account_number: string } }>('POST', '/payment/verify-account', { accountNumber, bankCode }),

  // Upgrade, renew, or pay again after the month ran out.
  initStageUpgrade: (stage: StageKey, renewal: Renewal) =>
    req<{ success: true; data: { authorizationUrl: string; reference: string; amount: number } }>('POST', '/payment/init-stage', { stage, renewal }),

  verifyStageUpgrade: (reference: string) =>
    req<{ success: true; message: string; data: { stage: string } }>('GET', `/payment/verify-stage?reference=${encodeURIComponent(reference)}`),

  turnOffAutoRenew: () =>
    req<{ success: true; message: string }>('POST', '/payment/renewal', { mode: 'manual' }),

  verifyModulePayment: (reference: string) =>
    req<{ success: true; message: string }>('GET', `/payment/verify-module?reference=${encodeURIComponent(reference)}`),
};

export const studentApi = {
  getDashboard: () =>
    req<{ success: true; data: any }>('GET', '/student/dashboard'),

  getCommissions: () =>
    req<{ success: true; data: any[] }>('GET', '/student/commissions'),

  getWithdrawals: () =>
    req<{ success: true; data: any[] }>('GET', '/student/withdrawals'),

  getBankAccount: () =>
    req<{ success: true; data: { bankName: string; bankCode: string; accountNumber: string; accountName: string } }>('GET', '/student/bank-account'),

  saveBankAccount: (payload: { bankName: string; bankCode: string; accountNumber: string; accountName: string }) =>
    req<{ success: true; message: string }>('PATCH', '/student/bank-account', payload),

  requestWithdrawal: (payload: { amount: number }) =>
    req<{ success: true; message: string; data: any }>('POST', '/student/withdrawals', payload),

  getReferrals: () =>
    req<{ success: true; data: any }>('GET', '/student/referrals'),

  getCourses: () =>
    req<{ success: true; data: any[] }>('GET', '/student/courses'),

  updateProfile: (payload: { name?: string; phone?: string }) =>
    req<{ success: true; message: string; data: any }>('PATCH', '/student/profile', payload),

  changePassword: (currentPassword: string, newPassword: string) =>
    req<{ success: true; message: string }>('POST', '/student/change-password', { currentPassword, newPassword }),

};

export const publicApi = {
  getSettings: () =>
    req<{ success: true; data: { commissionRates: number[]; subscriptionPrice: number; stagePrices?: Record<StageKey, number>; trialDays: number } }>('GET', '/settings/public'),

  getCourses: () =>
    req<{ success: true; data: Array<{ id: string; title: string; description: string; thumbnail: string; category: string; difficulty: string; modulesCount: number; whatYouLearn: string[] }> }>('GET', '/courses/public'),
};

export const notificationApi = {
  list: () =>
    req<{ success: true; data: Array<{ id: string; title: string; message: string; read: boolean }> }>('GET', '/student/notifications'),
  markRead: (id: string) =>
    req<{ success: true }>('PUT', `/student/notifications/${id}/read`),
};

export const chatApi = {
  getMessages: () =>
    req<{ success: true; data: any[] }>('GET', '/chat/messages'),
  send: (message: string) =>
    req<{ success: true; data: any }>('POST', '/chat/send', { message }),
  unreadCount: () =>
    req<{ success: true; data: { count: number } }>('GET', '/chat/unread-count'),
};

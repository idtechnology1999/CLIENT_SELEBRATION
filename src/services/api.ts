const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SERVER_BASE = BASE.replace(/\/api$/, '');

export function fixUrl(url?: string): string | undefined {
  if (!url) return url;
  return url.replace(/^http:\/\/localhost:\d+/, SERVER_BASE);
}

const TOKEN_KEY = 'selliberation_user_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
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

  login: (email: string, password: string) =>
    req<{ success: true; token: string; data: any }>('POST', '/user-auth/login', { email, password }),

  me: () =>
    req<{ success: true; data: any }>('GET', '/user-auth/me'),
};

export const paymentApi = {
  initSubscription: () =>
    req<{ success: true; data: { authorizationUrl: string; reference: string; amount: number } }>('POST', '/payment/init'),

  verifySubscription: (reference: string) =>
    req<{ success: true; message: string; data: { reference: string; amount: number } }>('GET', `/payment/verify?reference=${encodeURIComponent(reference)}`),

  initModulePayment: (courseId: string, moduleId: string) =>
    req<{ success: true; data: { authorizationUrl: string; reference: string; amount: number } }>('POST', '/payment/init-module', { courseId, moduleId }),

  verifyModulePayment: (reference: string) =>
    req<{ success: true; message: string; data: { moduleId: string; courseId: string } }>('GET', `/payment/verify-module?reference=${encodeURIComponent(reference)}`),

  verifyAccount: (accountNumber: string, bankCode: string) =>
    req<{ success: true; data: { account_name: string; account_number: string } }>('POST', '/payment/verify-account', { accountNumber, bankCode }),

  initStageUpgrade: (stage: string) =>
    req<{ success: true; data: { authorizationUrl: string; reference: string; amount: number } }>('POST', '/payment/init-stage', { stage }),

  verifyStageUpgrade: (reference: string) =>
    req<{ success: true; message: string; data: { stage: string; stageNum: number } }>('GET', `/payment/verify-stage?reference=${encodeURIComponent(reference)}`),
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

  getUnlockedModules: (courseId: string) =>
    req<{ success: true; data: string[] }>('GET', `/student/unlocked-modules?courseId=${encodeURIComponent(courseId)}`),
};

export const publicApi = {
  getSettings: () =>
    req<{ success: true; data: { commissionRates: number[]; subscriptionPrice: number; trialDays: number } }>('GET', '/settings/public'),

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

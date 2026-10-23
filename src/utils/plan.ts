// Paid plans a visitor can pick from the landing page (Fish is the free trial everyone starts on).
export const PAID_PLANS = {
  dolphin: 'Dolphin',
  shark: 'Shark',
  whale: 'Whale',
} as const;

export type PaidPlan = keyof typeof PAID_PLANS;

export function getPaidPlan(params: URLSearchParams): PaidPlan | null {
  const plan = params.get('plan')?.toLowerCase();
  return plan && plan in PAID_PLANS ? (plan as PaidPlan) : null;
}

// Where to send a user after they log in or sign up.
export function afterAuthPath(plan: PaidPlan | null): string {
  return plan ? `/dashboard/courses?upgrade=${plan}` : '/dashboard';
}

// Keeps the chosen plan when moving between the login and register pages.
export function withPlan(path: string, plan: PaidPlan | null): string {
  return plan ? `${path}?plan=${plan}` : path;
}

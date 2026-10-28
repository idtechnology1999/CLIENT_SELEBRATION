import { CreditCard, RefreshCw } from 'lucide-react';
import type { Renewal } from '../types';

interface Props {
  value: Renewal;
  onChange: (value: Renewal) => void;
  theme?: 'dark' | 'light';
}

const OPTIONS: { value: Renewal; title: string; detail: string; Icon: typeof RefreshCw }[] = [
  {
    value: 'auto',
    title: 'Renew automatically',
    detail: 'Your card is charged each month. Card only — you can turn it off anytime.',
    Icon: RefreshCw,
  },
  {
    value: 'manual',
    title: 'Renew manually',
    detail: 'Pay each month yourself by card, bank transfer or USSD. We remind you before it ends.',
    Icon: CreditCard,
  },
];

export default function RenewalOptions({ value, onChange, theme = 'light' }: Props) {
  const dark = theme === 'dark';
  return (
    <fieldset className="space-y-2">
      <legend className={`mb-2 text-sm ${dark ? 'text-gray-400' : 'text-gray-700 font-medium'}`}>
        How do you want to renew each month?
      </legend>
      {OPTIONS.map(({ value: v, title, detail, Icon }) => {
        const selected = value === v;
        return (
          <label
            key={v}
            className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
              selected
                ? 'border-amber-500 bg-amber-500/10'
                : dark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="renewal"
              value={v}
              checked={selected}
              onChange={() => onChange(v)}
              className="mt-1 accent-amber-500"
            />
            <Icon size={18} className={`mt-0.5 shrink-0 ${selected ? 'text-amber-500' : dark ? 'text-gray-400' : 'text-gray-400'}`} />
            <span>
              <span className={`block text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</span>
              <span className={`block text-xs mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{detail}</span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

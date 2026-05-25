import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { studentApi } from '../../services/api';

type FilterType = 'all' | 'pending' | 'withdrawable' | 'withdrawn';

interface Commission {
  id: string;
  payerId: string;
  courseId: string;
  level: number;
  amount: number;
  status: 'pending' | 'withdrawable' | 'withdrawn';
  createdAt: string;
}

export default function Earnings() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    studentApi.getCommissions()
      .then(res => setCommissions(res.data))
      .catch(err => setError(err.message || 'Failed to load earnings'))
      .finally(() => setLoading(false));
  }, []);

  const totalEarned = commissions.reduce((s, c) => s + c.amount, 0);
  const pending = commissions.filter(c => c.status === 'pending').reduce((s, c) => s + c.amount, 0);
  const withdrawable = commissions.filter(c => c.status === 'withdrawable').reduce((s, c) => s + c.amount, 0);
  const withdrawn = commissions.filter(c => c.status === 'withdrawn').reduce((s, c) => s + c.amount, 0);

  const filtered = filter === 'all' ? commissions : commissions.filter(c => c.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="text-gray-500">Track your commissions and revenue</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
          <AlertCircle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Total Earned', value: totalEarned, color: 'green', Icon: DollarSign },
          { label: 'Pending', value: pending, color: 'yellow', Icon: Clock },
          { label: 'Withdrawable', value: withdrawable, color: 'blue', Icon: TrendingUp },
          { label: 'Withdrawn', value: withdrawn, color: 'purple', Icon: CheckCircle },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                <Icon className={`text-${color}-600`} size={20} />
              </div>
              <span className="text-gray-500">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '—' : `₦${value.toLocaleString()}`}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold">Transaction History</h2>
          <div className="flex gap-2">
            {(['all', 'pending', 'withdrawable', 'withdrawn'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
                  filter === f ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Level</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Amount</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">No transactions yet</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">Level {c.level}</span>
                  </td>
                  <td className="px-5 py-4 font-bold text-green-600">₦{c.amount.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded text-sm capitalize ${
                      c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      c.status === 'withdrawable' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

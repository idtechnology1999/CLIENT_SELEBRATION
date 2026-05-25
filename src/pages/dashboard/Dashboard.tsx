import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, Users, DollarSign, BookOpen, ArrowRight, Gift, AlertCircle } from 'lucide-react';
import { studentApi, fixUrl } from '../../services/api';

interface DashboardData {
  stats: { totalEarned: number; pending: number; withdrawable: number; withdrawn: number };
  referralCount: number;
  stage: number;
  subscription: string;
  trialEndsAt: string;
  coursesCount: number;
  courses: { id: string; name: string; thumbnail?: string; price: number; modulesCount: number }[];
}

const STAGE_LABELS = ['Starter', 'Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5'];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    studentApi.getDashboard()
      .then(res => setData(res.data))
      .catch(err => setError(err.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const stage = data?.stage ?? user?.stage ?? 0;
  const stats = data?.stats ?? { totalEarned: 0, pending: 0, withdrawable: 0, withdrawn: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hello {user?.name} 👋</h1>
          <p className="text-gray-500">Welcome to your dashboard</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg">
          <Gift className="text-amber-500" size={20} />
          <span className="font-medium text-amber-700">{STAGE_LABELS[stage] || `Stage ${stage}`}</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
          <AlertCircle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earned', value: stats.totalEarned, color: 'green', Icon: DollarSign },
          { label: 'Pending', value: stats.pending, color: 'yellow', Icon: TrendingUp },
          { label: 'Withdrawable', value: stats.withdrawable, color: 'blue', Icon: DollarSign },
          { label: 'Active Courses', value: data?.coursesCount ?? 0, color: 'purple', Icon: BookOpen, raw: true },
        ].map(({ label, value, color, Icon, raw }) => (
          <div key={label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                <Icon className={`text-${color}-600`} size={20} />
              </div>
              <span className="text-gray-500">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '—' : raw ? value : `₦${value.toLocaleString()}`}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/dashboard/courses" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <BookOpen className="text-blue-600" size={20} />
            <span className="font-medium">My Courses</span>
          </Link>
          <Link to="/dashboard/referrals" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Users className="text-purple-600" size={20} />
            <span className="font-medium">View Referrals</span>
          </Link>
          <Link to="/dashboard/earnings" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <TrendingUp className="text-green-600" size={20} />
            <span className="font-medium">Earnings</span>
          </Link>
          <Link to="/dashboard/withdraw" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <DollarSign className="text-amber-600" size={20} />
            <span className="font-medium">Withdraw</span>
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Available Courses</h2>
          <Link to="/dashboard/courses" className="text-amber-600 hover:underline flex items-center gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : data?.courses.length === 0 ? (
          <p className="text-gray-400 text-sm">No courses available yet.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {data?.courses.map(course => (
              <div key={course.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="w-full h-32 bg-amber-100 flex items-center justify-center overflow-hidden">
                  {course.thumbnail
                    ? <img src={fixUrl(course.thumbnail)} alt={course.name} className="w-full h-full object-cover" />
                    : <BookOpen className="text-amber-400" size={40} />}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">{course.name}</h3>
                  <p className="text-xs text-gray-500">{course.modulesCount} Module{course.modulesCount !== 1 ? 's' : ''}</p>
                  <Link
                    to="/dashboard/courses"
                    className="mt-3 block text-center bg-gray-100 hover:bg-gray-200 py-2 rounded text-sm font-medium"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

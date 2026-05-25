import { useState, useEffect } from 'react';
import { Play, Lock, BookOpen, AlertCircle, ChevronLeft, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { studentApi, paymentApi, fixUrl } from '../../services/api';

const STAGES = [
  { key: 'free',  label: 'Free',           price: 0,      bg: 'bg-green-50',  border: 'border-green-300',  badge: 'bg-green-100 text-green-700',   icon: '🟢' },
  { key: 'fish',  label: 'Become a Fish',  price: 5000,   bg: 'bg-blue-50',   border: 'border-blue-300',   badge: 'bg-blue-100 text-blue-700',     icon: '🐟' },
  { key: 'shark', label: 'Become a Shark', price: 15000,  bg: 'bg-purple-50', border: 'border-purple-300', badge: 'bg-purple-100 text-purple-700', icon: '🦈' },
  { key: 'whale', label: 'Become a Whale', price: 150000, bg: 'bg-amber-50',  border: 'border-amber-300',  badge: 'bg-amber-100 text-amber-700',   icon: '🐋' },
];

interface Video { _id: string; title: string; description: string; videoUrl: string; }
interface StageData { stage: string; unlocked: boolean; videos: Video[]; videoCount: number; }
interface Course { id: string; title: string; thumbnail?: string; description?: string; stages: StageData[]; }

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({ free: true });
  const [lockedAlert, setLockedAlert] = useState('');
  const [upgradingStage, setUpgradingStage] = useState<string | null>(null);
  const [upgradeError, setUpgradeError] = useState('');

  useEffect(() => {
    studentApi.getCourses()
      .then((res: any) => setCourses(res.data))
      .catch((err: any) => setError(err.message || 'Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {[1,2,3].map(i => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="w-full h-36 sm:h-44 bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl text-sm">
      <AlertCircle size={18} className="shrink-0 mt-0.5" /><p>{error}</p>
    </div>
  );

  const handleUpgrade = async (stageKey: string) => {
    setUpgradingStage(stageKey);
    setUpgradeError('');
    try {
      const res = await paymentApi.initStageUpgrade(stageKey);
      if (res.success && res.data?.authorizationUrl) {
        window.location.href = res.data.authorizationUrl;
      } else {
        setUpgradeError((res as any).message || 'Failed to start payment');
        setUpgradingStage(null);
      }
    } catch (err: any) {
      setUpgradeError(err.message || 'Failed to start payment');
      setUpgradingStage(null);
    }
  };

  // ── Course viewer ──────────────────────────────────────────────────────────
  if (selectedCourse) return (
    <div className="space-y-4 max-w-2xl mx-auto w-full">

      {/* Back */}
      <button onClick={() => { setSelectedCourse(null); setPlayingVideo(null); }}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ChevronLeft size={15} /> Back to courses
      </button>

      {/* Course header */}
      <div className="flex items-start gap-3 sm:gap-4">
        {selectedCourse.thumbnail && (
          <img src={fixUrl(selectedCourse.thumbnail)} alt={selectedCourse.title}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-gray-100" />
        )}
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">{selectedCourse.title}</h1>
          {selectedCourse.description && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{selectedCourse.description}</p>
          )}
        </div>
      </div>

      {/* Video player */}
      {playingVideo && (
        <div className="bg-black rounded-xl overflow-hidden shadow-lg">
          <video controls autoPlay className="w-full max-h-[260px] sm:max-h-[360px]"
            src={playingVideo.videoUrl} key={playingVideo._id} />
          <div className="px-4 sm:px-5 py-3 bg-gray-900 text-white flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{playingVideo.title}</p>
              {playingVideo.description && (
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{playingVideo.description}</p>
              )}
            </div>
            <button onClick={() => setPlayingVideo(null)}
              className="text-gray-500 hover:text-white text-xs shrink-0 mt-0.5 whitespace-nowrap">
              ✕ Close
            </button>
          </div>
        </div>
      )}

      {/* Upgrade error */}
      {upgradeError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle size={15} className="shrink-0" />
          <p className="flex-1">{upgradeError}</p>
          <button onClick={() => setUpgradeError('')} className="text-red-400 hover:text-red-600 shrink-0">✕</button>
        </div>
      )}

      {/* Locked video alert */}
      {lockedAlert && (
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl text-sm">
          <Lock size={15} className="shrink-0" />
          <p className="flex-1">{lockedAlert}</p>
          <button onClick={() => setLockedAlert('')} className="text-orange-400 hover:text-orange-600 shrink-0">✕</button>
        </div>
      )}

      {/* Stages */}
      <div className="space-y-3">
        {STAGES.map(st => {
          const stageData = selectedCourse.stages.find(s => s.stage === st.key);
          const isUnlocked = stageData?.unlocked ?? false;
          const videos = stageData?.videos ?? [];
          const videoCount = stageData?.videoCount ?? 0;
          const isExpanded = expandedStages[st.key] ?? false;

          const toggleExpand = () =>
            setExpandedStages(prev => ({ ...prev, [st.key]: !prev[st.key] }));

          return (
            <div key={st.key}
              className={`rounded-xl border-2 overflow-hidden transition-all ${isUnlocked ? st.border : 'border-gray-200'}`}>

              {/* Stage header — always clickable to expand/collapse */}
              <button onClick={toggleExpand}
                className={`w-full flex items-center justify-between px-4 sm:px-5 py-3.5 text-left transition-colors ${
                  isUnlocked ? `${st.bg} hover:opacity-90` : 'bg-gray-50 hover:bg-gray-100'
                }`}>
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <span className="text-lg sm:text-xl shrink-0">{st.icon}</span>
                  <div className="min-w-0">
                    <span className={`text-sm font-bold ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                      {st.label}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      {videoCount} video{videoCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {st.price > 0 && !isUnlocked && (
                    <span className="hidden sm:inline text-xs font-medium text-gray-400">
                      ₦{st.price.toLocaleString()}
                    </span>
                  )}
                  {isUnlocked
                    ? <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.badge}`}>Unlocked</span>
                    : <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                        <Lock size={9} /> Locked
                      </span>
                  }
                  {isExpanded
                    ? <ChevronUp size={15} className="text-gray-400 ml-1" />
                    : <ChevronDown size={15} className="text-gray-400 ml-1" />
                  }
                </div>
              </button>

              {/* Collapsible content */}
              {isExpanded && (
                videoCount === 0 ? (
                  <div className="px-5 py-5 text-center text-sm text-gray-400 bg-white">
                    No videos added yet.
                  </div>
                ) : isUnlocked ? (
                  // UNLOCKED — fully playable
                  <div className="divide-y divide-gray-100 bg-white">
                    {videos.map((v, i) => (
                      <button key={v._id} onClick={() => { setPlayingVideo(v); setLockedAlert(''); }}
                        className={`w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 text-left transition-colors ${
                          playingVideo?._id === v._id ? 'bg-amber-50' : 'hover:bg-gray-50'
                        }`}>
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
                          playingVideo?._id === v._id ? 'bg-amber-500' : 'bg-gray-100'
                        }`}>
                          <Play size={12} className={playingVideo?._id === v._id ? 'text-white' : 'text-gray-500'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{i + 1}. {v.title}</p>
                          {v.description && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate hidden sm:block">{v.description}</p>
                          )}
                        </div>
                        {playingVideo?._id === v._id && (
                          <span className="text-xs text-amber-600 font-semibold shrink-0">Playing</span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  // LOCKED — titles visible, clicking shows upgrade prompt
                  <div className="bg-white">
                    <div className="divide-y divide-gray-50">
                      {videos.map((v, i) => (
                        <button key={v._id}
                          onClick={() => setLockedAlert(`"${v.title}" is locked. Upgrade to ${st.label} (₦${st.price.toLocaleString()}) to watch this video.`)}
                          className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 text-left hover:bg-gray-50 transition-colors">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <Lock size={11} className="text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-400 truncate">{i + 1}. {v.title}</p>
                          </div>
                          <span className="text-xs text-gray-300 shrink-0">Locked</span>
                        </button>
                      ))}
                    </div>
                    <div className="px-4 sm:px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <p className="text-xs text-gray-400">
                        Upgrade to unlock {videoCount} video{videoCount !== 1 ? 's' : ''}
                        {st.price > 0 ? ` — ₦${st.price.toLocaleString()}` : ''}
                      </p>
                      <button
                        onClick={() => handleUpgrade(st.key)}
                        disabled={upgradingStage === st.key}
                        className="shrink-0 px-4 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap flex items-center gap-1.5 disabled:opacity-70"
                        style={{ background: '#F5820A' }}>
                        {upgradingStage === st.key
                          ? <><Loader size={11} className="animate-spin" /> Processing...</>
                          : <>Upgrade to {st.label} →</>
                        }
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Course list ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-500 text-sm mt-0.5">Select a course to start learning</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 sm:p-14 text-center">
          <BookOpen className="mx-auto text-gray-300 mb-3" size={44} />
          <p className="text-gray-400 text-sm">No courses available yet</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {courses.map(course => {
            const totalVideos = course.stages.reduce((n, s) => n + s.videoCount, 0);
            const unlockedCount = course.stages.filter(s => s.unlocked).length;
            return (
              <div key={course.id}
                onClick={() => { setSelectedCourse(course); setPlayingVideo(null); setExpandedStages({ free: true }); setLockedAlert(''); }}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:border-amber-300 hover:shadow-md transition-all active:scale-[0.98]">
                <div className="w-full h-36 sm:h-44 bg-amber-50 flex items-center justify-center overflow-hidden">
                  {course.thumbnail
                    ? <img src={fixUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover" />
                    : <BookOpen className="text-amber-300" size={44} />}
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="font-bold text-base mb-1 leading-tight">{course.title}</h3>
                  {course.description && (
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{course.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span>{totalVideos} total videos</span>
                    <span>{unlockedCount} of 4 levels unlocked</span>
                  </div>
                  {/* Stage dots */}
                  <div className="flex gap-1.5 mb-4">
                    {STAGES.map(st => {
                      const stData = course.stages.find(s => s.stage === st.key);
                      const isUnlocked = stData?.unlocked ?? false;
                      return (
                        <div key={st.key} title={st.label}
                          className={`flex-1 h-1.5 rounded-full ${isUnlocked ? 'bg-amber-500' : 'bg-gray-200'}`} />
                      );
                    })}
                  </div>
                  <button className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors">
                    <Play size={14} /> Open Course
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

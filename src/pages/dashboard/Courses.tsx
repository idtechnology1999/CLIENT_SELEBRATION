import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Lock, BookOpen, AlertCircle, ChevronLeft, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { studentApi, paymentApi, fixUrl } from '../../services/api';

const STAGES = [
  { key: 'fish',    label: 'Become a Fish',    price: 5000,   trial: true,  bg: 'bg-blue-50',   border: 'border-blue-300',   badge: 'bg-blue-100 text-blue-700',    icon: '🐟' },
  { key: 'dolphin', label: 'Become a Dolphin', price: 15000,  trial: false, bg: 'bg-teal-50',   border: 'border-teal-300',   badge: 'bg-teal-100 text-teal-700',    icon: '🐬' },
  { key: 'shark',   label: 'Become a Shark',   price: 50000,  trial: false, bg: 'bg-purple-50', border: 'border-purple-300', badge: 'bg-purple-100 text-purple-700', icon: '🦈' },
  { key: 'whale',   label: 'Become a Whale',   price: 150000, trial: false, bg: 'bg-amber-50',  border: 'border-amber-300',  badge: 'bg-amber-100 text-amber-700',  icon: '🐋' },
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
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({ fish: true });
  const [lockedAlert, setLockedAlert] = useState('');
  const [upgradingStage, setUpgradingStage] = useState<string | null>(null);
  const [upgradeError, setUpgradeError] = useState('');

  useEffect(() => {
    studentApi.getCourses()
      .then((res: any) => setCourses(res.data))
      .catch((err: any) => setError(err.message || 'Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (stageKey: string) =>
    setExpandedStages(prev => ({ ...prev, [stageKey]: !prev[stageKey] }));

  const openCourse = (course: Course, fromStageKey: string) => {
    setSelectedCourse(course);
    setPlayingVideo(null);
    setExpandedStages({ [fromStageKey]: true });
    setLockedAlert('');
    setUpgradeError('');
  };

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

  // Coming from a plan button on the landing page (?upgrade=shark):
  // open that stage and start its payment, unless the user already has it.
  const [searchParams, setSearchParams] = useSearchParams();
  const upgradeParam = searchParams.get('upgrade');
  const autoUpgradeDone = useRef(false);

  useEffect(() => {
    if (loading || !upgradeParam || autoUpgradeDone.current) return;
    autoUpgradeDone.current = true;
    setSearchParams({}, { replace: true });

    const stage = STAGES.find(s => s.key === upgradeParam && !s.trial);
    if (!stage) return;
    setExpandedStages({ [stage.key]: true });

    const alreadyUnlocked = courses.some(c => c.stages.some(s => s.stage === stage.key && s.unlocked));
    if (!alreadyUnlocked) handleUpgrade(stage.key);
  }, [loading, upgradeParam, courses, setSearchParams]);

  if (loading) return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="rounded-xl border-2 border-gray-200 animate-pulse">
          <div className="h-14 bg-gray-100 rounded-xl" />
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl text-sm">
      <AlertCircle size={18} className="shrink-0 mt-0.5" /><p>{error}</p>
    </div>
  );

  // ── Course player ──────────────────────────────────────────────────────────
  if (selectedCourse) {
    // Determine which stage the user came from
    const activeStageKey = Object.keys(expandedStages).find(k => expandedStages[k]) ?? 'fish';
    const activeStageDef = STAGES.find(s => s.key === activeStageKey) ?? STAGES[0];
    const activeStageData = selectedCourse.stages.find(s => s.stage === activeStageKey);
    const isUnlocked = activeStageData?.unlocked ?? false;
    const videos = activeStageData?.videos ?? [];
    const videoCount = activeStageData?.videoCount ?? 0;

    return (
      <div className="space-y-4 max-w-2xl mx-auto w-full">

        {/* Back */}
        <button onClick={() => { setSelectedCourse(null); setPlayingVideo(null); setLockedAlert(''); setUpgradeError(''); }}
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
            {/* Stage badge */}
            <span className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${activeStageDef.badge}`}>
              {activeStageDef.icon} {activeStageDef.label} · {isUnlocked ? 'Unlocked' : 'Locked'}
            </span>
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

        {/* Errors / alerts */}
        {upgradeError && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <AlertCircle size={15} className="shrink-0" />
            <p className="flex-1">{upgradeError}</p>
            <button onClick={() => setUpgradeError('')} className="text-red-400 hover:text-red-600 shrink-0">✕</button>
          </div>
        )}
        {lockedAlert && (
          <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl text-sm">
            <Lock size={15} className="shrink-0" />
            <p className="flex-1">{lockedAlert}</p>
            <button onClick={() => setLockedAlert('')} className="text-orange-400 hover:text-orange-600 shrink-0">✕</button>
          </div>
        )}

        {/* Video list for this stage */}
        <div className={`rounded-xl border-2 overflow-hidden ${isUnlocked ? activeStageDef.border : 'border-gray-200'}`}>
          {videoCount === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400 bg-white">
              No videos in this stage yet.
            </div>
          ) : isUnlocked ? (
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
            <div className="bg-white">
              <div className="divide-y divide-gray-50">
                {videos.map((v, i) => (
                  <button key={v._id}
                    onClick={() => setLockedAlert(`"${v.title}" is locked. Upgrade to ${activeStageDef.label} (₦${activeStageDef.price.toLocaleString()}) to watch this video.`)}
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
                  {activeStageDef.trial
                    ? `Your 7-day free trial has ended — pay ₦${activeStageDef.price.toLocaleString()} to unlock ${videoCount} video${videoCount !== 1 ? 's' : ''}`
                    : `Upgrade to unlock ${videoCount} video${videoCount !== 1 ? 's' : ''} — ₦${activeStageDef.price.toLocaleString()}`
                  }
                </p>
                <button
                  onClick={() => handleUpgrade(activeStageDef.key)}
                  disabled={upgradingStage === activeStageDef.key}
                  className="shrink-0 px-4 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap flex items-center gap-1.5 disabled:opacity-70"
                  style={{ background: '#F5820A' }}>
                  {upgradingStage === activeStageDef.key
                    ? <><Loader size={11} className="animate-spin" /> Processing...</>
                    : activeStageDef.trial
                      ? <>Continue as Fish — ₦{activeStageDef.price.toLocaleString()} →</>
                      : <>Upgrade to {activeStageDef.label} →</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Stage list (default view) ──────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-500 text-sm mt-0.5">Select a stage to browse your courses</p>
      </div>

      {upgradeError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle size={15} className="shrink-0" />
          <p className="flex-1">{upgradeError}</p>
          <button onClick={() => setUpgradeError('')} className="text-red-400 hover:text-red-600 shrink-0">✕</button>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 sm:p-14 text-center">
          <BookOpen className="mx-auto text-gray-300 mb-3" size={44} />
          <p className="text-gray-400 text-sm">No courses available yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {STAGES.map(st => {
            const stageCourses = courses.filter(c =>
              c.stages.some(s => s.stage === st.key && s.videoCount > 0)
            );
            // Stage unlock is global — a stage is unlocked if any course reflects it as unlocked
            const isUnlocked = courses.some(c =>
              c.stages.some(s => s.stage === st.key && s.unlocked)
            );
            const totalVideos = stageCourses.reduce((n, c) => {
              const s = c.stages.find(s => s.stage === st.key);
              return n + (s?.videoCount ?? 0);
            }, 0);
            const isExpanded = expandedStages[st.key] ?? false;

            return (
              <div key={st.key}
                className={`rounded-xl border-2 overflow-hidden transition-all ${isUnlocked ? st.border : 'border-gray-200'}`}>

                {/* Stage header */}
                <button onClick={() => toggleExpand(st.key)}
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
                        {stageCourses.length} course{stageCourses.length !== 1 ? 's' : ''}
                        {totalVideos > 0 && ` · ${totalVideos} video${totalVideos !== 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {!isUnlocked && (
                      <span className="hidden sm:inline text-xs font-medium text-gray-400">
                        ₦{st.price.toLocaleString()}
                      </span>
                    )}
                    {isUnlocked
                      ? <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.badge}`}>
                          {st.trial ? '🎉 Trial Active' : 'Unlocked'}
                        </span>
                      : <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                          <Lock size={9} /> {st.trial ? 'Trial Ended' : 'Locked'}
                        </span>
                    }
                    {isExpanded
                      ? <ChevronUp size={15} className="text-gray-400 ml-1" />
                      : <ChevronDown size={15} className="text-gray-400 ml-1" />
                    }
                  </div>
                </button>

                {/* Course list for this stage */}
                {isExpanded && (
                  stageCourses.length === 0 ? (
                    <div className="px-5 py-5 text-center text-sm text-gray-400 bg-white">
                      No courses in this stage yet.
                    </div>
                  ) : (
                    <div className="bg-white">
                      <div className="divide-y divide-gray-100">
                        {stageCourses.map(course => {
                          const stageData = course.stages.find(s => s.stage === st.key);
                          const videoCount = stageData?.videoCount ?? 0;
                          return (
                            <button key={course.id}
                              onClick={() => openCourse(course, st.key)}
                              className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 text-left hover:bg-gray-50 transition-colors">
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-amber-50 shrink-0 flex items-center justify-center border border-gray-100">
                                {course.thumbnail
                                  ? <img src={fixUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover" />
                                  : <BookOpen className="text-amber-300" size={20} />
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{course.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {videoCount} video{videoCount !== 1 ? 's' : ''} in this stage
                                </p>
                              </div>
                              <div className="shrink-0 flex items-center gap-1">
                                {isUnlocked
                                  ? <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                                      <Play size={11} /> Open
                                    </span>
                                  : <span className="flex items-center gap-1 text-xs text-gray-400">
                                      <Lock size={11} /> Locked
                                    </span>
                                }
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Upgrade footer for locked stages */}
                      {!isUnlocked && (
                        <div className="px-4 sm:px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          {st.trial ? (
                            <>
                              <p className="text-xs text-gray-400">
                                Your 7-day free trial has ended — pay ₦{st.price.toLocaleString()} to continue
                              </p>
                              <button
                                onClick={() => handleUpgrade(st.key)}
                                disabled={upgradingStage === st.key}
                                className="shrink-0 px-4 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap flex items-center gap-1.5 disabled:opacity-70"
                                style={{ background: '#F5820A' }}>
                                {upgradingStage === st.key
                                  ? <><Loader size={11} className="animate-spin" /> Processing...</>
                                  : <>Continue as Fish — ₦{st.price.toLocaleString()} →</>
                                }
                              </button>
                            </>
                          ) : (
                            <>
                              <p className="text-xs text-gray-400">
                                Upgrade to unlock — ₦{st.price.toLocaleString()}
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
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronDown, ChevronUp, ArrowLeft, BookOpen, AlertCircle,
  Play, Lock, Clock, Layers, X, Crown, CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentApi, paymentApi, fixUrl } from '../../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoData {
  _id: string;
  title: string;
  videoUrl: string;
  duration: number;
  orderIndex: number;
}

interface SubModuleData {
  _id: string;
  title: string;
  description: string;
  orderIndex: number;
  videos: VideoData[];
  resources: { _id: string; title: string; fileUrl: string; fileType: string; orderIndex: number }[];
}

interface ModuleData {
  _id: string;
  title: string;
  description: string;
  orderIndex: number;
  isFree: boolean;
  price: number;
  submodules: SubModuleData[];
}

interface CourseData {
  id: string;
  name: string;
  thumbnail?: string;
  description?: string;
  price: number;
  modulesCount: number;
  modules: ModuleData[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDur(s: number): string {
  if (!s) return '';
  if (s >= 3600) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function getYtId(url: string): string | null {
  const m = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function flatVideos(mod: ModuleData): (VideoData & { subTitle: string })[] {
  return mod.submodules
    .slice().sort((a, b) => a.orderIndex - b.orderIndex)
    .flatMap(s => s.videos.slice().sort((a, b) => a.orderIndex - b.orderIndex).map(v => ({ ...v, subTitle: s.title })));
}

function modDuration(mod: ModuleData): number {
  return mod.submodules.reduce((s, sub) => s + sub.videos.reduce((ss, v) => ss + (v.duration || 0), 0), 0);
}

// ─── Video Modal ──────────────────────────────────────────────────────────────

function VideoModal({ video, onClose }: { video: VideoData; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const ytId = getYtId(video.videoUrl);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex flex-col bg-black md:items-center md:justify-center md:p-4"
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop blur on desktop only */}
      <div className="hidden md:block absolute inset-0 bg-black/85 backdrop-blur-sm" />

      <div className="relative z-10 flex flex-col w-full md:max-w-4xl md:rounded-2xl overflow-hidden shadow-2xl h-full md:h-auto">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-950 shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{video.title}</p>
            {video.duration > 0 && (
              <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                <Clock size={10} /> {fmtDur(video.duration)}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Player */}
        <div className="relative bg-black" style={{ paddingTop: 'min(56.25%, calc(100dvh - 60px))' }}>
          <div className="absolute inset-0">
            {ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="w-full h-full"
              />
            ) : video.videoUrl ? (
              <video
                src={video.videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-400 text-sm">No video source available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────

function Thumb({ url, alt }: { url: string; alt: string }) {
  const ytId = getYtId(url);
  if (ytId) {
    return (
      <img
        src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
        alt={alt}
        className="w-full h-full object-cover"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  // For uploaded videos show a rich gradient so the card never looks blank
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
        <Play className="text-white/50" size={20} fill="rgba(255,255,255,0.4)" />
      </div>
    </div>
  );
}

// ─── Video Card ───────────────────────────────────────────────────────────────

function VideoCard({ video, canPlay, onClick, onLockedClick, lockLabel }: {
  video: VideoData & { subTitle: string };
  canPlay: boolean;
  onClick: () => void;
  onLockedClick: () => void;
  lockLabel?: string;
}) {
  const handleClick = canPlay ? onClick : onLockedClick;

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
      className={`group relative flex flex-col rounded-xl overflow-hidden border bg-white transition-all duration-200 cursor-pointer active:scale-[.98] ${
        canPlay
          ? 'border-gray-200 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/10'
          : 'border-gray-100 hover:border-gray-300'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ paddingTop: '56.25%' }}>
        <div className="absolute inset-0">
          <Thumb url={video.videoUrl} alt={video.title} />
        </div>

        {canPlay ? (
          /* Free/accessible: play button always visible, brighter on hover */
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-white/80 group-hover:bg-white shadow-lg flex items-center justify-center scale-95 group-hover:scale-100 transition-all duration-200">
              <Play size={16} className="text-gray-900 ml-0.5" fill="currentColor" />
            </div>
          </div>
        ) : (
          /* Locked: blurred overlay + lock icon, clicking goes to payment */
          <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 group-hover:bg-gray-900/60 transition-colors">
            <div className="w-10 h-10 rounded-full bg-amber-500/90 group-hover:bg-amber-500 border-2 border-amber-400/50 flex items-center justify-center shadow-lg transition-colors">
              <Lock size={15} className="text-white" />
            </div>
            <span className="text-white text-[10px] font-bold tracking-widest uppercase">{lockLabel ?? 'Pay to unlock'}</span>
          </div>
        )}

        {video.duration > 0 && (
          <span className="absolute bottom-1.5 right-1.5 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded font-mono leading-none">
            {fmtDur(video.duration)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className={`text-xs font-semibold leading-snug line-clamp-2 ${canPlay ? 'text-gray-900' : 'text-gray-500'}`}>
          {!canPlay && <Lock size={9} className="inline mr-1 text-amber-500 mb-0.5" />}
          {video.title}
        </p>
        {video.subTitle && (
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{video.subTitle}</p>
        )}
      </div>
    </div>
  );
}

// ─── Module Row ───────────────────────────────────────────────────────────────

function ModuleRow({
  module, courseId, index, canAccess, expanded, onToggle, onVideoPlay, onPayClick,
}: {
  module: ModuleData;
  courseId: string;
  index: number;
  canAccess: boolean;
  expanded: boolean;
  onToggle: () => void;
  onVideoPlay: (v: VideoData) => void;
  onPayClick: (moduleId: string, courseId: string) => void;
}) {
  const videos = flatVideos(module);
  const preview = videos.slice(0, 3);
  const extra = videos.length - preview.length;
  const dur = modDuration(module);

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${expanded ? 'border-gray-200 shadow-sm' : 'border-gray-200'}`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-4 bg-white hover:bg-gray-50/80 transition-colors text-left"
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
          canAccess ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'
        }`}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm leading-snug">{module.title}</span>
            {module.isFree && (
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Free</span>
            )}
            {!canAccess && (
              <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-0.5">
                <Lock size={8} /> Premium
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5 mt-0.5 text-[11px] text-gray-400">
            <span className="flex items-center gap-1"><Play size={9} /> {videos.length} video{videos.length !== 1 ? 's' : ''}</span>
            {dur > 0 && <span className="flex items-center gap-1"><Clock size={9} /> {fmtDur(dur)}</span>}
          </div>
        </div>
        <div className="shrink-0 text-gray-400">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Body */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/40 px-4 py-4 space-y-4">
          {module.description && (
            <p className="text-xs text-gray-500 leading-relaxed">{module.description}</p>
          )}

          {videos.length === 0 ? (
            <p className="text-xs text-gray-400 py-3 text-center">No videos in this module yet.</p>
          ) : (
            <>
              {/* Video grid: 1 col mobile, 2 col tablet, 3 col desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {preview.map(v => (
                  <VideoCard
                    key={v._id}
                    video={v}
                    canPlay={canAccess}
                    onClick={() => onVideoPlay(v)}
                    onLockedClick={() => onPayClick(module._id, courseId)}
                    lockLabel={module.price > 0 ? `₦${module.price.toLocaleString()} to unlock` : 'Subscribe to unlock'}
                  />
                ))}
              </div>

              {/* More videos */}
              {extra > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[11px] text-gray-400 shrink-0">
                    +{extra} more video{extra !== 1 ? 's' : ''}
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              )}

              {/* Lock CTA */}
              {!canAccess && (
                <div className="flex items-center gap-3 bg-white border border-amber-200 rounded-xl px-4 py-3.5">
                  <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                    <Crown size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">Unlock this module</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {module.price > 0 ? `Pay ₦${module.price.toLocaleString()} to watch ${videos.length} video${videos.length !== 1 ? 's' : ''}` : `Subscribe to watch ${videos.length} video${videos.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <button
                    onClick={() => onPayClick(module._id, courseId)}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg shrink-0 transition-colors"
                  >
                    {module.price > 0 ? `₦${module.price.toLocaleString()}` : 'Subscribe'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CourseDetail() {
  const { courseSlug } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<number | null>(0);
  const [playing, setPlaying] = useState<VideoData | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');
  const [unlockedModuleIds, setUnlockedModuleIds] = useState<string[]>([]);

  const handleModulePayClick = async (moduleId: string, courseId: string) => {
    setPayLoading(true);
    setPayError('');
    try {
      const res = await paymentApi.initModulePayment(courseId, moduleId);
      if (res.data?.authorizationUrl) {
        window.location.href = res.data.authorizationUrl;
      } else {
        setPayError('Payment initialization failed. Please try again.');
      }
    } catch (err: any) {
      setPayError(err.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setPayLoading(false);
    }
  };

  const handleSubscribeClick = async () => {
    setPayLoading(true);
    setPayError('');
    try {
      const res = await paymentApi.initSubscription();
      if (res.data?.authorizationUrl) {
        window.location.href = res.data.authorizationUrl;
      } else {
        setPayError('Payment initialization failed. Please try again.');
      }
    } catch (err: any) {
      setPayError(err.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setPayLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await studentApi.getCourses();
        if (cancelled) return;

        const found = res.data.find((c: CourseData) => c.id === courseSlug);
        if (!found) {
          setError('Course not found');
          setLoading(false);
          return;
        }

        setCourse(found);

        try {
          const unlockRes = await studentApi.getUnlockedModules(found.id);
          if (!cancelled) {
            setUnlockedModuleIds(unlockRes.data);
          }
        } catch {
          // unlock fetch failed, ignore
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load course');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => { cancelled = true; };
  }, [courseSlug]);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-5 w-24 bg-gray-200 rounded-lg" />
        <div className="h-52 bg-gray-200 rounded-2xl" />
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/dashboard/courses" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium">
          <ArrowLeft size={15} /> Back to Courses
        </Link>
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <BookOpen className="text-gray-200" size={52} />
        <p className="text-gray-500 font-medium">Course not found</p>
        <Link to="/dashboard/courses" className="text-amber-600 hover:underline text-sm">Back to courses</Link>
      </div>
    );
  }

  const isActive = user?.subscription === 'active';
  const sorted = course.modules.slice().sort((a, b) => a.orderIndex - b.orderIndex);
  const totalVids = sorted.reduce((s, m) => s + flatVideos(m).length, 0);
  const totalDur = sorted.reduce((s, m) => s + modDuration(m), 0);
  const freeCount = sorted.filter(m => m.isFree).length;

  // Helper: can user access a specific module
  function canAccessModule(mod: ModuleData): boolean {
    if (mod.isFree) return true;                                    // Free modules: always accessible
    if (unlockedModuleIds.includes(mod._id)) return true;        // Individually paid: accessible
    if (isActive && mod.price === 0) return true;               // Subscribed + $0 module: accessible
    return false;
  }

  return (
    <>
      {/* Full-screen video modal */}
      {playing && <VideoModal video={playing} onClose={() => setPlaying(null)} />}

      <div className="space-y-4 pb-10">
        {/* Back */}
        <Link to="/dashboard/courses" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
          <ArrowLeft size={15} /> Back to Courses
        </Link>

        {/* ── Hero ── */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="relative h-48 md:h-60 bg-gray-900">
            {course.thumbnail
              ? <img src={fixUrl(course.thumbnail)} alt={course.name} className="w-full h-full object-cover opacity-55" />
              : <div className="w-full h-full bg-gradient-to-br from-amber-900/50 to-gray-900 flex items-center justify-center"><BookOpen className="text-white/10" size={72} /></div>
            }
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h1 className="text-xl md:text-2xl font-bold text-white leading-tight mb-2">{course.name}</h1>
              {/* Stats pills */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-gray-300 text-xs bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <Layers size={11} /> {course.modulesCount} modules
                </span>
                <span className="inline-flex items-center gap-1 text-gray-300 text-xs bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <Play size={11} /> {totalVids} videos
                </span>
                {totalDur > 0 && (
                  <span className="inline-flex items-center gap-1 text-gray-300 text-xs bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <Clock size={11} /> {fmtDur(totalDur)}
                  </span>
                )}
                {isActive && sorted.every(m => m.isFree || m.price === 0 || unlockedModuleIds.includes(m._id)) ? (
                  <span className="inline-flex items-center gap-1 text-green-300 text-xs bg-green-500/20 border border-green-500/30 px-2.5 py-1 rounded-full">
                    <CheckCircle size={11} /> Full access
                  </span>
                ) : isActive ? (
                  <span className="inline-flex items-center gap-1 text-amber-300 text-xs bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-full">
                    <Crown size={11} /> Subscribed — pay per module
                  </span>
                ) : freeCount > 0 ? (
                  <span className="inline-flex items-center gap-1 text-amber-300 text-xs bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-full">
                    <Play size={11} /> {freeCount} free module{freeCount !== 1 ? 's' : ''}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          {course.description && (
            <div className="bg-white px-5 py-3.5">
              <p className="text-gray-500 text-sm leading-relaxed">{course.description}</p>
            </div>
          )}
        </div>

        {/* ── Subscribe banner ── */}
        {!isActive && (
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl px-5 py-4 shadow-lg shadow-amber-500/20">
            <Crown className="text-white shrink-0 hidden sm:block" size={24} />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-white font-bold text-sm">Unlock the full course</p>
              <p className="text-amber-100 text-xs mt-0.5">
                {freeCount > 0 ? `${freeCount} free module${freeCount !== 1 ? 's' : ''} available — subscribe to unlock everything` : 'Subscribe to access all modules and videos'}
              </p>
            </div>
            <button
              onClick={handleSubscribeClick}
              disabled={payLoading}
              className="bg-white text-amber-600 hover:bg-amber-50 disabled:opacity-60 font-bold text-sm px-5 py-2.5 rounded-xl shrink-0 shadow-sm whitespace-nowrap transition-colors"
            >
              {payLoading ? 'Redirecting…' : 'Subscribe — ₦5,000/mo'}
            </button>
          </div>
        )}

        {payError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {payError}
          </div>
        )}

        {/* ── Module list ── */}
        <div className="space-y-1">
          <h2 className="text-base font-bold text-gray-900 px-1 mb-3">Course Content</h2>
          {sorted.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
              <BookOpen className="mx-auto text-gray-200 mb-3" size={36} />
              <p className="text-gray-400 text-sm">No modules yet. Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sorted.map((mod, idx) => (
                <ModuleRow
                  key={mod._id ?? idx}
                  module={mod}
                  courseId={course.id}
                  index={idx}
                  canAccess={canAccessModule(mod)}
                  expanded={expanded === idx}
                  onToggle={() => setExpanded(expanded === idx ? null : idx)}
                  onVideoPlay={setPlaying}
                  onPayClick={handleModulePayClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getToken } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SERVER_URL = API_BASE.replace(/\/api$/, '');

interface ChatMsg {
  _id: string;
  conversationId: string;
  senderType: 'user' | 'admin';
  senderName: string;
  message: string;
  createdAt: string;
}

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Connect socket and join user room
  useEffect(() => {
    if (!user) return;
    const token = getToken();
    if (!token) return;

    const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join:user', { userId: user.id, token });
    });

    socket.on('chat:message', (data: { message: ChatMsg }) => {
      setMessages(prev => {
        if (prev.some(m => m._id === data.message._id)) return prev;
        return [...prev, data.message];
      });
      if (data.message.senderType === 'admin') {
        setUnread(prev => prev + 1);
      }
    });

    // Fetch initial unread count
    fetch(`${API_BASE}/chat/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setUnread(d.data.count); })
      .catch(() => {});

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  // Fetch messages when chat opens
  useEffect(() => {
    if (!open || !user) return;
    setUnread(0);
    fetchMessages();
  }, [open]);

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/chat/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMessages(data.data);
    } catch {}
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => {
          if (prev.some(m => m._id === data.data._id)) return prev;
          return [...prev, data.data];
        });
      }
    } catch {}
    setSending(false);
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div
          className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: '460px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ background: '#0D2847' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(245,130,10,0.25)', color: '#F5820A' }}
              >
                S
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-none">Support</p>
                <p className="text-white/50 text-[11px] mt-0.5">We usually reply in minutes</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#F7F8FA' }}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader size={20} className="animate-spin text-gray-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                  style={{ background: 'rgba(13,40,71,0.08)' }}
                >
                  <MessageCircle size={24} style={{ color: '#0D2847' }} />
                </div>
                <p className="text-sm font-semibold text-gray-700">Hi there!</p>
                <p className="text-xs text-gray-400 mt-1">Send us a message — we're here to help.</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg._id} className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      msg.senderType === 'user' ? 'rounded-br-sm text-white' : 'rounded-bl-sm text-gray-800 bg-white shadow-sm'
                    }`}
                    style={msg.senderType === 'user' ? { background: '#F5820A' } : { border: '1px solid rgba(0,0,0,0.06)' }}
                  >
                    {msg.senderType === 'admin' && (
                      <p className="text-[10px] font-bold mb-1" style={{ color: '#0D2847' }}>
                        {msg.senderName}
                      </p>
                    )}
                    <p className="leading-relaxed">{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${msg.senderType === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Type a message..."
              className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none transition-colors"
              style={{ focusBorderColor: '#F5820A' } as React.CSSProperties}
              maxLength={2000}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-opacity disabled:opacity-40 shrink-0"
              style={{ background: '#F5820A' }}
            >
              {sending ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white relative transition-transform hover:scale-105 active:scale-95"
        style={{ background: '#0D2847' }}
        aria-label="Open support chat"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white rounded-full bg-red-500 shadow">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </div>
  );
}

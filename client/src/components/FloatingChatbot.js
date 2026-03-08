import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { aiApi } from '../api/services';

const SESSION_KEY = 'staynear_session_id';

const getOrCreateSessionId = () => {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `sess_${Date.now()}`;
  }
};

const createNewSessionId = () => {
  const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  try {
    localStorage.setItem(SESSION_KEY, id);
  } catch (_) {}
  return id;
};

const INTRO_MESSAGE = {
  role: 'assistant',
  content: 'Hi, I am StayNear AI. Tell me your budget, preferred room type, and facilities, and I will shortlist rooms for you.',
  suggestedQuestions: ['Under Rs 10,000', 'Single room with AC', 'Near me within 5 km']
};

const normalizeText = (text) => String(text || '').trim().replace(/\s+/g, ' ').toLowerCase();

export default function FloatingChatbot() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INTRO_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(getOrCreateSessionId);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const appendAssistantMessage = (msg) => {
    setMessages((prev) => {
      const lastAssistant = [...prev].reverse().find((m) => m.role === 'assistant');
      const nextContent = normalizeText(msg.content);
      if (lastAssistant && normalizeText(lastAssistant.content) === nextContent) {
        return [
          ...prev,
          {
            role: 'assistant',
            content: 'Unable to service that request right now. Please try with different preferences.',
            suggestedQuestions: ['Change budget', 'Any room type', 'Any facilities']
          }
        ];
      }
      return [...prev, msg];
    });
  };

  const sendUserMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;

    setInput('');
    const userMsg = { role: 'user', content: trimmed };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    let lat = null;
    let lng = null;
    const lower = trimmed.toLowerCase();
    if (lower.includes('near me') || lower.includes('current location') || lower.includes('my location')) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch (_) {}
    }

    try {
      const { data } = await aiApi.chat({ sessionId, message: trimmed, lat, lng });
      const payload = data?.data || {};

      if (payload.type === 'recommendations' && Array.isArray(payload.recommendations) && payload.recommendations.length > 0) {
        appendAssistantMessage({
          role: 'assistant',
          content: payload.message || 'Here are your best matches.',
          recommendations: payload.recommendations
        });
      } else if (payload.type === 'follow_up') {
        appendAssistantMessage({
          role: 'assistant',
          content: payload.text || 'Unable to service this request right now.',
          suggestedQuestions: payload.suggestedQuestions || []
        });
      } else {
        appendAssistantMessage({
          role: 'assistant',
          content: 'Unable to service this request right now. Please refine your preferences.'
        });
      }
    } catch (_) {
      appendAssistantMessage({
        role: 'assistant',
        content: 'Unable to service this request right now. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompareThese = (recommendations) => {
    const ids = (recommendations || []).map((r) => r.roomId).filter(Boolean);
    if (ids.length) {
      setOpen(false);
      navigate(`/compare?ids=${ids.join(',')}`);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:opacity-90 flex items-center justify-center transition-colors duration-300"
        aria-label="Open chat"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-full max-w-[380px] rounded-2xl bg-[#E5DDD5] dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[75vh] sm:max-h-[65vh] transition-colors duration-300">
          <div className="flex items-center justify-between px-4 py-3 bg-[#075E54] text-white transition-colors duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-lg">AI</span>
              </div>
              <div>
                <p className="font-semibold">StayNear AI</p>
                <p className="text-xs text-white/80">PG recommendation assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setSessionId(createNewSessionId());
                  setMessages([INTRO_MESSAGE]);
                }}
                className="p-2 rounded-full hover:bg-white/10"
                title="New chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0 bg-[#E5DDD5] dark:bg-gray-800 transition-colors duration-300">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className="max-w-[85%] rounded-lg rounded-tr-none px-3 py-2 shadow-md bg-[#DCF8C6] text-airbnb-black text-sm">
                    {msg.content}
                  </div>
                ) : (
                  <div className="max-w-[85%]">
                    <div className="rounded-lg rounded-tl-none px-3 py-2 shadow-md bg-white dark:bg-gray-700 text-airbnb-black dark:text-gray-100 text-sm whitespace-pre-wrap">
                      {msg.content}
                    </div>
                    {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.suggestedQuestions.map((q, j) => (
                          <button
                            key={j}
                            type="button"
                            onClick={() => sendUserMessage(q)}
                            className="text-xs px-2.5 py-1.5 rounded-full bg-white dark:bg-gray-700 border border-[#075E54]/30 text-[#075E54] dark:text-green-300 hover:bg-[#075E54] hover:text-white transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {msg.recommendations.map((rec, j) => (
                          <div key={j} className="rounded-lg overflow-hidden bg-white dark:bg-gray-700 shadow border border-gray-100 dark:border-gray-600 transition-colors duration-300">
                            <div className="flex gap-2 p-2">
                              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-airbnb-gray-light">
                                {rec.image ? (
                                  <img src={rec.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-airbnb-gray text-xs">No image</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-airbnb-black dark:text-gray-100 text-sm truncate">{rec.title}</p>
                                <p className="text-xs text-airbnb-pink font-medium">Rs {Number(rec.price || 0).toLocaleString()}/mo</p>
                                {rec.distanceKm != null && <p className="text-xs text-airbnb-gray dark:text-gray-300">{rec.distanceKm} km away</p>}
                              </div>
                            </div>
                            <div className="p-2 border-t border-gray-100 dark:border-gray-600">
                              <Link to={`/rooms/${rec.roomId}`} className="block text-center text-xs font-medium text-[#075E54] dark:text-green-300 hover:underline">
                                View room
                              </Link>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleCompareThese(msg.recommendations)}
                          className="w-full rounded-lg py-2 text-xs font-medium bg-[#075E54] text-white hover:bg-[#054d44] transition-colors duration-300"
                        >
                          Compare these
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg rounded-tl-none px-3 py-2 shadow bg-white dark:bg-gray-700 text-airbnb-gray dark:text-gray-200 text-sm flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-airbnb-gray animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="inline-block w-2 h-2 rounded-full bg-airbnb-gray animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="inline-block w-2 h-2 rounded-full bg-airbnb-gray animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-2 bg-[#F0F2F5] dark:bg-gray-900 flex gap-2 items-center border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendUserMessage()}
              placeholder="Type a message"
              className="flex-1 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-airbnb-black dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50"
            />
            <button
              type="button"
              onClick={() => sendUserMessage()}
              disabled={loading || !input.trim()}
              className="rounded-full bg-[#25D366] text-white p-2.5 disabled:opacity-50 hover:bg-[#20BD5A] transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

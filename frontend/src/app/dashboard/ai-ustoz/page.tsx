'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, BookOpen, FileQuestion, Map, Brain, Zap, GraduationCap } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { PageShell } from '@/components/shared/page-shell';
import { MotionButton } from '@/components/motion/motion-button';
import { ChatBubble } from '@/components/motion/chat-bubble';
import { TypingIndicator } from '@/components/motion/typing-text';
import { extractThoughtsAndFinal } from '@/lib/parseThink';
import { Settings2, X, Upload } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

const modes = [
  { icon: BookOpen, label: 'Tushuntirish', desc: "Mavzularni chuqur o'rganish", gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', iconColor: 'text-blue-400' },
  { icon: FileQuestion, label: 'Test yaratish', desc: 'Savollar va mashqlar', gradient: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30', iconColor: 'text-violet-400' },
  { icon: Map, label: "O'quv rejasi", desc: "Kunlik tayyorlov rejasi", gradient: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30', iconColor: 'text-emerald-400' },
  { icon: Zap, label: 'Tezkor javob', desc: "Oddiy savolga tez javob", gradient: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', iconColor: 'text-amber-400' },
];

const suggestions = [
  '🧮 Trigonometriyani tushuntiring',
  '📝 DTM matematika — 20 savol',
  '📅 30 kunlik tayyorlov rejasi',
  '⚡ Nyuton qonunlari misollar bilan',
  '🧬 DNK va RNK farqlari',
  '📊 Statistika asoslari',
];

type Message = { role: 'user' | 'assistant'; content: string; thoughts?: string[]; id: string };

interface Settings {
  llm_model: string;
  llm_model_multilingual: string;
  top_k: number;
  relevance_threshold: number;
  temperature: number;
}

interface Source {
  filename: string;
  status: 'ready' | 'processing' | 'error';
  is_active: boolean;
}

export default function AIUstozPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    inputRef.current?.focus();
    // Fetch initial settings
    fetch(`${API_BASE}/settings`).then(r => r.json()).then(setSettings).catch(console.error);
    fetch(`${API_BASE}/models`).then(r => r.json()).then(m => setModels(m.models || [])).catch(console.error);
    fetchSources();
  }, []);

  useEffect(() => {
    const hasProcessing = sources.some(s => s.status === 'processing');
    if (hasProcessing) {
      const timer = setInterval(fetchSources, 3000);
      return () => clearInterval(timer);
    }
  }, [sources]);

  async function fetchSources() {
    try {
      const res = await fetch(`${API_BASE}/sources`);
      setSources(await res.json());
    } catch (e) { console.error(e); }
  }

  async function toggleSource(filename: string) {
    try {
      await fetch(`${API_BASE}/sources/${encodeURIComponent(filename)}/toggle`, { method: 'PUT' });
      await fetchSources();
    } catch (e) { console.error(e); }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const target = e.target;
    if (!target.files || !target.files[0]) return;
    const file = target.files[0];
    setUploading(true);
    setStatusMsg(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/sources/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error((await res.json()).detail || 'Upload failed');
      await fetchSources();
      setStatusMsg({ type: 'ok', msg: 'File uploaded, processing started...' });
    } catch (e: any) {
      setStatusMsg({ type: 'err', msg: e.message });
    } finally {
      setUploading(false);
      target.value = '';
    }
  }

  async function saveSettings() {
    if (!settings) return;
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Save failed');
      setStatusMsg({ type: 'ok', msg: 'Settings saved ✓' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (e: any) {
      setStatusMsg({ type: 'err', msg: e.message });
    } finally {
      setSaving(false);
    }
  }

  const askBackend = async (questionStr: string) => {
    setTyping(true);
    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionStr, language: 'uz', explain_further: false }),
      });
      const data = await res.json();
      const { thoughts, finalText } = extractThoughtsAndFinal(data.answer);
      setMessages((m) => [...m, { role: 'assistant', content: finalText, thoughts, id: `a-${Date.now()}` }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: "⚠️ Serverga ulanib bo'lmadi. Backend ishga tushirilganini tekshiring.", id: `err-${Date.now()}` },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || typing) return;
    setMessages((m) => [...m, { role: 'user', content: msg, id: `u-${Date.now()}` }]);
    setInput('');
    await askBackend(msg);
  };

  return (
    <>
      <AppHeader 
        title="AI Ustoz" 
        subtitle="Milliy til · DTM standartlari · 24/7" 
        actions={
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 rounded-xl bg-ink-950 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-ink-900 transition-colors"
          >
            <Settings2 className="h-4 w-4" /> Sozlamalar
          </button>
        }
      />
      <PageShell className="flex h-[calc(100dvh-5.5rem)] max-w-4xl flex-col !py-4 lg:!py-6 relative">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-950/80 backdrop-blur-xl shadow-2xl">
          
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 scrollbar-hide" role="log" aria-live="polite">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center">
                {/* Welcome Hero */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="text-center mb-10"
                >
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500/30 to-violet-500/30 ring-1 ring-white/10 shadow-lg shadow-brand-500/10">
                    <GraduationCap className="h-10 w-10 text-brand-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Assalomu alaykum! 👋</h2>
                  <p className="mt-3 text-sm text-white/50 max-w-md leading-relaxed">
                    Men sizning shaxsiy AI ustozingizman. O'zbek tilida istalgan fandan savol bering — sodda va tushunarli tilda tushuntiraman.
                  </p>
                </motion.div>

                {/* Mode Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mb-8"
                >
                  {modes.map((m, i) => (
                    <motion.button
                      key={m.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className={`group flex flex-col items-center gap-3 rounded-2xl border ${m.border} bg-gradient-to-b ${m.gradient} p-4 text-center transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/5`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                        <m.icon className={`h-5 w-5 ${m.iconColor}`} strokeWidth={1.75} />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white block">{m.label}</span>
                        <span className="text-[10px] text-white/40 mt-0.5 block leading-tight">{m.desc}</span>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            ) : (
              <div className="space-y-5">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <ChatBubble key={msg.id} role={msg.role} content={msg.content} thoughts={msg.thoughts} layoutId={msg.id} />
                  ))}
                </AnimatePresence>
                {typing && (
                  <div className="flex justify-start pl-12">
                    <TypingIndicator />
                  </div>
                )}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-white/[0.06] bg-ink-950/90 p-4 sm:p-5">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-4 flex flex-wrap justify-center gap-2"
              >
                {suggestions.map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => send(s.replace(/^[^\s]+\s/, ''))}
                    className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/60 hover:border-brand-500/40 hover:text-brand-400 hover:bg-brand-500/5 transition-all duration-200"
                  >
                    {s}
                  </motion.button>
                ))}
              </motion.div>
            )}
            <form className="flex items-center gap-3" onSubmit={(e) => { e.preventDefault(); send(); }}>
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Savolingizni yozing..."
                  className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.04] px-5 py-3.5 pr-12 text-sm text-white placeholder:text-white/30 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all duration-200"
                />
                <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/15" />
              </div>
              <motion.button
                type="submit"
                disabled={typing || !input.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/25 hover:bg-brand-500 disabled:opacity-30 disabled:shadow-none transition-all duration-200"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </form>
          </div>
        </div>

        {/* Settings Modal Slide-over */}
        <AnimatePresence>
          {showSettings && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowSettings(false)}
                className="absolute inset-0 z-40 bg-ink-950/40 backdrop-blur-sm rounded-2xl"
              />
              <motion.div 
                initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute right-0 top-0 bottom-0 z-50 w-full sm:w-[400px] border-l border-white/[0.08] bg-ink-950 rounded-r-2xl sm:rounded-2xl shadow-2xl overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-white/[0.08] p-5">
                  <h3 className="text-lg font-semibold text-white">Chat Sozlamalari</h3>
                  <button onClick={() => setShowSettings(false)} className="text-white/50 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-5 space-y-6">
                  {/* Sources Section */}
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-brand-400 uppercase tracking-wider">Manbalar (Sources)</h4>
                      <label className="cursor-pointer text-xs flex items-center gap-1 text-white/50 hover:text-white">
                        <Upload className="h-3 w-3" /> Yuklash
                        <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
                      </label>
                    </div>
                    {uploading && <p className="text-xs text-brand-400 mb-2 animate-pulse">Yuklanmoqda...</p>}
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide pr-2">
                      {sources.length === 0 ? (
                        <p className="text-xs text-white/30 italic">Manba yo'q</p>
                      ) : (
                        sources.map(s => (
                          <div key={s.filename} className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
                            <div className="min-w-0 flex-1 pr-3">
                              <p className="text-sm text-white truncate" title={s.filename}>{s.filename}</p>
                              <p className={`text-[10px] ${s.status === 'processing' ? 'text-amber-400' : 'text-emerald-400'}`}>{s.status}</p>
                            </div>
                            <label className="relative inline-flex cursor-pointer items-center">
                              <input type="checkbox" className="peer sr-only" checked={s.is_active} onChange={() => toggleSource(s.filename)} disabled={s.status !== 'ready'} />
                              <div className="h-5 w-9 rounded-full bg-white/10 peer-checked:bg-brand-500 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full"></div>
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  <div className="h-px bg-white/[0.08]" />

                  {/* Models Section */}
                  {settings && (
                    <section className="space-y-4">
                      <h4 className="text-sm font-semibold text-brand-400 uppercase tracking-wider">Modellar (LLM)</h4>
                      
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Standard Model (English)</label>
                        <select 
                          value={settings.llm_model}
                          onChange={(e) => setSettings({ ...settings, llm_model: e.target.value })}
                          className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] p-2.5 text-sm text-white outline-none focus:border-brand-500/50"
                        >
                          {models.map(m => <option key={m} value={m} className="bg-ink-950">{m}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-white/50 mb-1">Multilingual Model (Uzbek/Russian)</label>
                        <select 
                          value={settings.llm_model_multilingual}
                          onChange={(e) => setSettings({ ...settings, llm_model_multilingual: e.target.value })}
                          className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] p-2.5 text-sm text-white outline-none focus:border-brand-500/50"
                        >
                          {models.map(m => <option key={m} value={m} className="bg-ink-950">{m}</option>)}
                        </select>
                      </div>

                      <button 
                        onClick={saveSettings} 
                        disabled={saving}
                        className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                      </button>

                      {statusMsg && (
                        <p className={`text-xs text-center ${statusMsg.type === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {statusMsg.msg}
                        </p>
                      )}
                    </section>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </PageShell>
    </>
  );
}

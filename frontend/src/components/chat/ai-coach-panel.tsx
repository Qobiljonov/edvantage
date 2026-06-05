'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Brain, MessageCircle } from 'lucide-react';
import { ChatBubble } from '@/components/motion/chat-bubble';
import { TypingIndicator } from '@/components/motion/typing-text';
import { extractThoughtsAndFinal } from '@/lib/parseThink';

const API_BASE = 'http://127.0.0.1:8000';

const quickActions = [
  'Bu mavzuni tushuntir',
  'Test yaratib ber',
  "O'quv reja tuz",
];

type Message = { role: 'user' | 'assistant'; content: string; thoughts?: string[]; id: string };

export function AiCoachPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

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
        { role: 'assistant', content: "⚠️ Serverga ulanib bo'lmadi.", id: `err-${Date.now()}` },
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
    <div className="flex h-full flex-col rounded-2xl border border-white/[0.06] bg-ink-950 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] p-4 bg-gradient-to-r from-brand-600/10 to-violet-600/10">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 ring-1 ring-brand-500/30">
          <Brain className="h-4.5 w-4.5 text-brand-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-white">AI Ustoz</h2>
          <p className="text-[10px] text-white/40">Doim tayyor yordamchi</p>
        </div>
        <div className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide space-y-3" role="log" aria-live="polite">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center px-4">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-violet-500/20 ring-1 ring-white/10">
              <MessageCircle className="h-7 w-7 text-brand-400" />
            </div>
            <p className="text-xs font-medium text-white/70 mb-1">Savol bering!</p>
            <p className="text-[10px] text-white/30 max-w-[180px] leading-relaxed">
              O'zbek tilida yozing — AI Ustoz sodda tilda tushuntiradi.
            </p>
            <div className="mt-6 flex flex-col gap-2 w-full max-w-[220px]">
              {quickActions.map((action, i) => (
                <motion.button
                  key={action}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => send(action)}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-[11px] font-medium text-white/50 hover:border-brand-500/30 hover:text-brand-400 hover:bg-brand-500/5 transition-all text-left"
                >
                  {action}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <ChatBubble key={msg.id} role={msg.role} content={msg.content} thoughts={msg.thoughts} layoutId={msg.id} />
          ))}
        </AnimatePresence>
        {typing && (
          <div className="flex justify-start pl-10">
            <TypingIndicator />
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.06] p-3 bg-ink-950/80">
        <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Savol yozing..."
            className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs text-white placeholder:text-white/25 focus:border-brand-500/40 focus:outline-none focus:ring-1 focus:ring-brand-500/10 transition-all"
          />
          <motion.button
            type="submit"
            disabled={typing || !input.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-500 disabled:opacity-25 disabled:shadow-none transition-all"
          >
            <Send className="h-3.5 w-3.5" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}

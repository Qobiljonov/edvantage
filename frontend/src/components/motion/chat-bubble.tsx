'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { messageBubble } from '@/lib/motion';
import { Bot, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  thoughts?: string[];
  layoutId?: string;
}

const formatMarkdown = (text: string) => {
  if (!text) return '';
  let processed = text;
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$');
  processed = processed.replace(/\(\s*(.*?\\(?:lambda|sin|cos|tan|omega|phi|pi|times|frac|dots).*?)\s*\)/g, '$$ $1 $$');
  return processed;
};

export function ChatBubble({ role, content, thoughts, layoutId }: ChatBubbleProps) {
  const [thoughtsOpen, setThoughtsOpen] = useState(false);

  return (
    <motion.div
      layout
      layoutId={layoutId}
      variants={messageBubble}
      initial="initial"
      animate="animate"
      className={cn('flex mb-4', role === 'user' ? 'justify-end' : 'justify-start')}
    >
      {role === 'assistant' && (
        <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600">
          <Bot className="h-4 w-4 text-white" aria-hidden />
        </div>
      )}
      <div
        className={cn(
          'max-w-[90%] rounded-2xl px-4 py-3 sm:max-w-[80%]',
          role === 'user' ? 'bg-ink-800 text-white' : 'bg-white/5 border border-ink-800 text-ink-100'
        )}
      >
        {role === 'assistant' && thoughts && thoughts.length > 0 && (
          <div className="mb-3 rounded-lg border border-ink-800 bg-ink-950 overflow-hidden">
            <button 
              className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-ink-secondary hover:bg-ink-900 transition-colors"
              onClick={() => setThoughtsOpen(!thoughtsOpen)}
            >
              <span className="flex items-center gap-2"><Brain className="h-3 w-3" /> AI Fikrlash Jarayoni</span>
              {thoughtsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {thoughtsOpen && (
              <div className="border-t border-ink-800 bg-ink-950 p-3 text-xs font-mono text-ink-tertiary max-h-64 overflow-y-auto">
                {thoughts.map((t, idx) => (
                  <div key={idx} className="mb-2 last:mb-0">{t}</div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={cn("text-[15px] leading-relaxed", role === 'assistant' && 'prose prose-invert max-w-none')}>
          {role === 'user' ? (
            <p className="whitespace-pre-wrap m-0">{content}</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {formatMarkdown(content)}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </motion.div>
  );
}

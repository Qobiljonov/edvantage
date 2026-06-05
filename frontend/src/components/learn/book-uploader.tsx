'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { useLearn } from '@/lib/learn/store';
import type { Book } from '@/lib/learn/types';
import type { PipelineStep } from '@/lib/learn/rag';

export function BookUploader() {
  const { addBook } = useLearn();
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pipeline, setPipeline] = useState<PipelineStep[]>([]);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      setPipeline([]);
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await fetch('/api/learn/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Xatolik');
        setPipeline(data.pipeline);
        addBook(data.book as Book);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Yuklash muvaffaqiyatsiz');
      } finally {
        setLoading(false);
      }
    },
    [addBook]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  return (
    <div className="rounded-2xl border border-learn-border bg-learn-card p-5">
      <h3 className="font-semibold text-learn-text">Kitob yuklash</h3>
      <p className="mt-1 text-xs text-learn-muted">
        PDF yoki EPUB — AI roadmap va testlar yaratadi
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 transition ${
          drag ? 'border-learn-accent bg-learn-accent/10' : 'border-learn-border bg-learn-surface'
        }`}
      >
        {loading ? (
          <Loader2 className="h-10 w-10 animate-spin text-learn-accent" />
        ) : (
          <Upload className="h-10 w-10 text-learn-muted" />
        )}
        <p className="mt-3 text-sm font-medium">Faylni torting yoki tanlang</p>
        <label className="mt-4 cursor-pointer rounded-full bg-learn-accent px-5 py-2 text-sm font-semibold text-white hover:opacity-90">
          Fayl tanlash
          <input
            type="file"
            accept=".pdf,.epub,application/pdf"
            className="hidden"
            disabled={loading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
          />
        </label>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {pipeline.length > 0 && (
        <motion.ul
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-2"
        >
          {pipeline.map((s) => (
            <li key={s.step} className="flex items-center gap-2 text-xs text-learn-muted">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              {s.message}
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}

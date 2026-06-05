'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Trash2, Eye, Plus, Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { PageShell } from '@/components/shared/page-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FadeUp } from '@/components/shared/motion';

const API_BASE = 'http://127.0.0.1:8000';

type Source = {
  filename: string;
  status: string;
  is_active: boolean;
};

export default function KutubxonaPage() {
  const [drag, setDrag] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
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
      if (!res.ok) throw new Error('Failed to fetch');
      setSources(await res.json());
    } catch (e) {
      console.error(e);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const target = e.target;
    if (!target.files || !target.files[0]) return;
    const file = target.files[0];
    
    setUploading(true);
    setErrorMsg(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/sources/upload`, { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Upload failed');
      }
      await fetchSources();
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setUploading(false);
      target.value = '';
    }
  }

  async function deleteSource(filename: string) {
    if (!confirm(`Haqiqatan ham ${filename} ni o'chirmoqchimisiz?`)) return;
    try {
      await fetch(`${API_BASE}/sources/${encodeURIComponent(filename)}`, { method: 'DELETE' });
      await fetchSources();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <AppHeader title="Bilimlar kutubxonasi" subtitle="Hujjatlar va AI qayta ishlash" />
      <PageShell>
        <motion.div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            // Ignore drag and drop for now to keep things simple, users click the button
          }}
          animate={{ scale: drag ? 1.005 : 1 }}
          className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-16 transition-colors ${
            drag ? 'border-brand-500 bg-brand-50/50' : 'border-ink-200 bg-white'
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-950">
            <Upload className="h-6 w-6 text-white" aria-hidden />
          </div>
          <p className="mt-5 text-lg font-semibold text-ink">Fayllarni yuklang</p>
          <p className="mt-2 max-w-sm text-center text-sm text-ink-tertiary">
            Faqat PDF — maksimal 50 MB. AI avtomatik tahlil qiladi.
          </p>
          {errorMsg && <p className="mt-3 text-sm text-red-500">{errorMsg}</p>}
          
          <div className="mt-6">
            <input id="lib-file-upload" type="file" accept=".pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
            <Button variant="primary" className="gap-2" disabled={uploading} asChild>
              <label htmlFor="lib-file-upload" className="cursor-pointer">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {uploading ? 'Yuklanmoqda...' : 'Fayl tanlash'}
              </label>
            </Button>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sources.map((s, i) => {
            const isProcessing = s.status === 'processing';
            return (
              <FadeUp key={s.filename} delay={i * 0.05}>
                <article className="surface group flex h-full flex-col p-5 transition hover:shadow-medium">
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-50">
                      <FileText className="h-5 w-5 text-ink-secondary" strokeWidth={1.75} aria-hidden />
                    </div>
                    <Badge variant={isProcessing ? 'warning' : 'outline'}>{isProcessing ? 'Jarayonda' : 'PDF'}</Badge>
                  </div>
                  <h3 className="mt-4 line-clamp-2 text-sm font-semibold text-ink" title={s.filename}>{s.filename}</h3>
                  <p className="mt-1 text-2xs text-ink-tertiary capitalize">
                    Holati: {s.status} · {s.is_active ? 'Faol' : 'Nofaol'}
                  </p>
                  <div className="mt-4 flex gap-2 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                    <button
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 hover:bg-ink-50"
                      aria-label="Ko'rish"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 hover:border-red-200 hover:bg-red-50"
                      onClick={() => deleteSource(s.filename)}
                      aria-label="O'chirish"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </article>
              </FadeUp>
            );
          })}
        </div>
      </PageShell>
    </>
  );
}

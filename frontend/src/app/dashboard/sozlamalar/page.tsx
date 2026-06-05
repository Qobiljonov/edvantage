'use client';

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { PageShell } from '@/components/shared/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { student } from '@/lib/mock-data';

const API_BASE = 'http://127.0.0.1:8000';

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

export default function SozlamalarPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  useEffect(() => {
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

  async function toggleSource(filename: string) {
    try {
      await fetch(`${API_BASE}/sources/${encodeURIComponent(filename)}/toggle`, { method: 'PUT' });
      await fetchSources();
    } catch (e) { console.error(e); }
  }

  async function deleteSource(filename: string) {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;
    try {
      await fetch(`${API_BASE}/sources/${encodeURIComponent(filename)}`, { method: 'DELETE' });
      await fetchSources();
    } catch (e) { console.error(e); }
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
      setStatusMsg({ type: 'ok', msg: 'Settings saved to server ✅' });
    } catch (e: any) {
      setStatusMsg({ type: 'err', msg: e.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AppHeader title="Sozlamalar" subtitle="Profil, AI Modellar va Ma'lumotlar" />
      <PageShell narrow>
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white">
                {student.avatar}
              </div>
              <div>
                <p className="font-semibold text-white">{student.name}</p>
                <p className="text-xs text-ink-tertiary">{student.school} · {student.grade}</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: "To'liq ism", value: student.name, type: 'text' },
                { label: 'Email', value: 'sardor@example.uz', type: 'email' },
                { label: 'Telefon', value: '+998 90 123 45 67', type: 'tel' },
              ].map((f) => (
                <div key={f.label}>
                  <label htmlFor={f.label} className="label-caps">{f.label}</label>
                  <input
                    id={f.label}
                    type={f.type}
                    defaultValue={f.value}
                    className="mt-2 w-full rounded-xl border border-ink-800 bg-ink-900 px-4 py-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {settings && (
          <Card className="mt-6 border-brand-500/20">
            <CardHeader>
              <CardTitle>AI Model Sozlamalari (Admin)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label className="text-sm font-medium text-ink-secondary mb-1 block">
                  Default LLM Model (English)
                </label>
                <select
                  className="w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
                  value={settings.llm_model}
                  onChange={(e) => setSettings({ ...settings, llm_model: e.target.value })}
                >
                  {models.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-ink-secondary mb-1 block">
                  Multilingual LLM Model (Uzbek/Russian)
                </label>
                <select
                  className="w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
                  value={settings.llm_model_multilingual}
                  onChange={(e) => setSettings({ ...settings, llm_model_multilingual: e.target.value })}
                >
                  {models.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-ink-secondary flex justify-between">
                  <span>Top K (Context Chunks)</span>
                  <span className="text-brand-400">{settings.top_k}</span>
                </label>
                <input
                  type="range" min={1} max={10} step={1}
                  className="w-full mt-2"
                  value={settings.top_k}
                  onChange={(e) => setSettings({ ...settings, top_k: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-secondary flex justify-between">
                  <span>Relevance Threshold</span>
                  <span className="text-brand-400">{settings.relevance_threshold.toFixed(2)}</span>
                </label>
                <input
                  type="range" min={0.1} max={0.9} step={0.05}
                  className="w-full mt-2"
                  value={settings.relevance_threshold}
                  onChange={(e) => setSettings({ ...settings, relevance_threshold: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-secondary flex justify-between">
                  <span>Temperature</span>
                  <span className="text-brand-400">{settings.temperature.toFixed(1)}</span>
                </label>
                <input
                  type="range" min={0} max={2} step={0.1}
                  className="w-full mt-2"
                  value={settings.temperature}
                  onChange={(e) => setSettings({ ...settings, temperature: Number(e.target.value) })}
                />
              </div>

              {statusMsg && (
                <div className={`p-3 rounded text-sm ${statusMsg.type === 'ok' ? 'bg-brand-500/10 text-brand-400' : 'bg-red-500/10 text-red-400'}`}>
                  {statusMsg.msg}
                </div>
              )}

              <Button onClick={saveSettings} disabled={saving} className="w-full bg-brand-600 hover:bg-brand-700 text-white">
                {saving ? 'Saqlanmoqda...' : 'Sozlamalarni saqlash'}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6 border-brand-500/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ma'lumotlar Bazasi (PDF Manbalar)</CardTitle>
            <div className="relative">
              <Button size="sm" variant="secondary" disabled={uploading}>
                {uploading ? 'Yuklanmoqda...' : '+ PDF Yuklash'}
              </Button>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleUpload} 
                disabled={uploading}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {sources.length === 0 ? (
              <p className="text-sm text-ink-tertiary">Manbalar mavjud emas.</p>
            ) : (
              sources.map(s => (
                <div key={s.filename} className="flex items-center justify-between p-3 rounded-lg border border-ink-800 bg-white/5">
                  <div>
                    <p className="text-sm font-medium text-white">{s.filename}</p>
                    <p className={`text-xs mt-1 ${s.status === 'ready' ? 'text-green-400' : s.status === 'processing' ? 'text-orange-400' : 'text-red-400'}`}>
                      {s.status.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={s.is_active}
                        onChange={() => toggleSource(s.filename)}
                        disabled={s.status !== 'ready'}
                      />
                      <div className="w-9 h-5 bg-ink-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"></div>
                    </label>
                    <button onClick={() => deleteSource(s.filename)} className="text-ink-tertiary hover:text-red-400 text-sm">
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </PageShell>
    </>
  );
}

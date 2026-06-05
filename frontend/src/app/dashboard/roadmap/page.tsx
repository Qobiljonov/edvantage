'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Calendar, ChevronRight, ArrowLeft } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { PageShell } from '@/components/shared/page-shell';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FadeUp } from '@/components/shared/motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const API_BASE = 'http://127.0.0.1:8000';

interface Task {
  id: string;
  type: 'read' | 'quiz' | 'read_section';
  title: string;
  content?: string;
  question?: string;
  answer?: string;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  keywords: {term: string; description: string}[];
  questions: {question: string; answer: string}[];
  explanation: string;
  chapter_content?: string;
  tasks: Task[];
}

interface RoadmapData {
  title: string;
  modules: Module[];
}

interface Roadmap {
  id: number;
  goal: string;
  source_filename: string;
  data: RoadmapData;
  status?: string;
}

interface Source {
  filename: string;
  status: string;
  is_active: boolean;
}

const formatMarkdown = (text: string) => {
  if (!text) return '';
  let processed = text;
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$');
  processed = processed.replace(/\(\s*(.*?\\(?:lambda|sin|cos|tan|omega|phi|pi|times|frac|dots).*?)\s*\)/g, '$$ $1 $$');
  return processed;
};

function TaskItem({ task, onToggle, isFirstSection }: { task: Task, onToggle: () => void, isFirstSection?: boolean }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [expanded, setExpanded] = useState(isFirstSection || false);

  return (
    <div className={`rounded-xl border ${task.completed ? 'border-brand-500 bg-brand-50' : 'border-ink-200 bg-white'} p-4 mb-3 shadow-sm transition-all`}>
      <div className="flex items-center gap-3 cursor-pointer" onClick={(e) => {
         if (task.type === 'read_section') {
           setExpanded(!expanded);
         } else {
           onToggle();
         }
      }}>
        <div 
          className={`flex h-6 w-6 items-center justify-center rounded-md border ${task.completed ? 'bg-brand-500 border-brand-500 text-white' : 'border-ink-300 bg-ink-50'}`}
          onClick={(e) => {
            if (task.type === 'read_section') {
              e.stopPropagation();
              onToggle();
            }
          }}
        >
          {task.completed && '✓'}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
            {task.type === 'read_section' ? '📖 Chapter Section' : task.type === 'read' ? '📖 Read' : '🧠 Quiz'}
          </span>
          <span className="text-sm font-medium text-ink">{task.title}</span>
        </div>
      </div>
      
      {task.type === 'read_section' && expanded && task.content && (
        <div className="mt-4 prose max-w-none text-sm text-ink-secondary">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{formatMarkdown(task.content)}</ReactMarkdown>
        </div>
      )}

      {task.type === 'read' && task.content && (
        <div className="mt-4 prose max-w-none text-sm text-ink-secondary">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{formatMarkdown(task.content)}</ReactMarkdown>
        </div>
      )}

      {task.type === 'quiz' && task.question && (
        <div className="mt-4 rounded-lg bg-ink-50 p-4 border border-ink-100">
          <div className="prose max-w-none text-sm text-ink-secondary">
            <strong className="text-ink">Q:</strong>
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{formatMarkdown(task.question)}</ReactMarkdown>
          </div>
          {showAnswer ? (
            <div className="mt-3 border-t border-ink-200 pt-3 prose max-w-none text-sm text-brand-600">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{formatMarkdown(task.answer || '')}</ReactMarkdown>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="mt-3" onClick={(e) => { e.stopPropagation(); setShowAnswer(true); }}>
              Reveal Answer
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [goal, setGoal] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [language, setLanguage] = useState('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  const [activeModule, setActiveModule] = useState<Module | null>(null);

  useEffect(() => {
    fetchRoadmaps();
    fetchSources();
  }, []);

  useEffect(() => {
    const hasGenerating = roadmaps.some(r => r.status === 'generating');
    if (hasGenerating) {
      const timer = setInterval(() => fetchRoadmaps(), 3000);
      return () => clearInterval(timer);
    }
  }, [roadmaps]);

  useEffect(() => {
    if (activeRoadmap) {
      const updated = roadmaps.find(r => r.id === activeRoadmap.id);
      if (updated && JSON.stringify(updated.data) !== JSON.stringify(activeRoadmap.data)) {
        setActiveRoadmap(updated);
        if (activeModule) {
           const updatedMod = updated.data.modules.find(m => m.id === activeModule.id);
           if (updatedMod) setActiveModule(updatedMod);
        }
      }
    }
  }, [roadmaps]);

  const fetchRoadmaps = async () => {
    try {
      const res = await fetch(`${API_BASE}/roadmaps`);
      if (res.ok) setRoadmaps(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchSources = async () => {
    try {
      const res = await fetch(`${API_BASE}/sources`);
      if (res.ok) {
        const data = await res.json();
        const readySources = data.filter((s: Source) => s.status === 'ready');
        setSources(readySources);
        if (readySources.length > 0) setSelectedSource(readySources[0].filename);
      }
    } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    if (!goal.trim() || !selectedSource) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/roadmap/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, source_filename: selectedSource, language })
      });
      if (res.ok) {
        const newRoadmap = await res.json();
        setRoadmaps([newRoadmap, ...roadmaps]);
        setShowCreate(false);
        setGoal('');
        setActiveRoadmap(newRoadmap);
      } else {
        alert('Failed to generate roadmap');
      }
    } catch (e) {
      alert("Network error.");
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteRoadmap = async (id: number) => {
    try {
      await fetch(`${API_BASE}/roadmaps/${id}`, { method: 'DELETE' });
      setRoadmaps(roadmaps.filter(r => r.id !== id));
      if (activeRoadmap?.id === id) {
        setActiveRoadmap(null);
        setActiveModule(null);
      }
    } catch (e) { console.error(e); }
  };

  const toggleTask = async (moduleId: string, taskId: string) => {
    if (!activeRoadmap) return;
    const newData = JSON.parse(JSON.stringify(activeRoadmap.data)) as RoadmapData;
    let updatedActiveModule = null;

    for (const mod of newData.modules) {
      if (mod.id === moduleId) {
        for (const task of mod.tasks) {
          if (task.id === taskId) task.completed = !task.completed;
        }
        if (activeModule?.id === moduleId) updatedActiveModule = mod;
      }
    }
    
    const updatedRoadmap = { ...activeRoadmap, data: newData };
    setActiveRoadmap(updatedRoadmap);
    setRoadmaps(roadmaps.map(r => r.id === updatedRoadmap.id ? updatedRoadmap : r));
    if (updatedActiveModule) setActiveModule(updatedActiveModule);
    
    try {
      await fetch(`${API_BASE}/roadmaps/${activeRoadmap.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: JSON.stringify(newData) })
      });
    } catch (e) { console.error(e); }
  };

  if (activeModule && activeRoadmap) {
    const totalTasks = activeModule.tasks?.length || 0;
    const completedTasks = activeModule.tasks?.filter(t => t.completed).length || 0;

    return (
      <>
        <AppHeader title="Module Details" subtitle={activeRoadmap.data.title} />
        <PageShell>
          <Button variant="outline" onClick={() => setActiveModule(null)} className="mb-6 gap-2 border-ink-200 text-ink hover:bg-ink-50">
            <ArrowLeft className="h-4 w-4" /> Back to Roadmap
          </Button>
          
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-ink">{activeModule.title}</h2>
            <div className="mt-4 flex items-center gap-4">
              <Progress value={totalTasks ? (completedTasks / totalTasks) * 100 : 0} className="w-64" />
              <span className="text-sm font-medium text-ink-secondary">{completedTasks} / {totalTasks} tasks completed</span>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-8 prose max-w-none text-sm text-ink-secondary">
                <h4 className="text-base font-semibold text-ink">AI Chapter Summary & Context</h4>
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{formatMarkdown(activeModule.chapter_content || '')}</ReactMarkdown>
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{formatMarkdown(activeModule.explanation || '')}</ReactMarkdown>
              </div>

              <h3 className="mb-4 text-xl font-semibold text-ink">Learning Materials & Tasks</h3>
              {(!activeModule.tasks || activeModule.tasks.length === 0) && activeRoadmap.status === 'generating' && (
                <div className="rounded-xl border border-ink-200 bg-ink-50 p-6 text-ink-secondary italic">
                  ⏳ AI is actively writing this module...
                </div>
              )}
              {activeModule.tasks?.map((task, idx) => {
                const isFirstSection = activeModule.tasks?.findIndex(t => t.type === 'read_section') === idx;
                return <TaskItem key={task.id} task={task} onToggle={() => toggleTask(activeModule.id, task.id)} isFirstSection={isFirstSection} />;
              })}
            </div>
            <div>
              <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-semibold text-ink">Key Concepts</h3>
                <div className="flex flex-col gap-3">
                  {activeModule.keywords?.map((kw, idx) => (
                    <div key={idx} className="rounded-lg bg-ink-50 p-3">
                      <p className="font-medium text-brand-600">{kw.term}</p>
                      <p className="mt-1 text-xs text-ink-tertiary">{kw.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PageShell>
      </>
    );
  }

  if (activeRoadmap) {
    return (
      <>
        <AppHeader title={activeRoadmap.data.title} subtitle={`Source: ${activeRoadmap.source_filename}`} />
        <PageShell>
          <Button variant="outline" onClick={() => setActiveRoadmap(null)} className="mb-6 gap-2 border-ink-200 text-ink hover:bg-ink-50">
            <ArrowLeft className="h-4 w-4" /> All Roadmaps
          </Button>

          <div className="relative mt-8 max-w-3xl">
            {activeRoadmap.data.modules.map((mod, i) => {
              const completed = mod.tasks?.length > 0 && mod.tasks.every(t => t.completed);
              return (
                <div key={mod.id} className="relative flex gap-6 pb-12" onClick={() => setActiveModule(mod)}>
                  {i !== activeRoadmap.data.modules.length - 1 && (
                    <div className="absolute left-[23px] top-12 bottom-0 w-px bg-ink-200/20" />
                  )}
                  <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-white font-bold transition-all cursor-pointer ${completed ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-secondary hover:bg-ink-200'}`}>
                    {completed ? '✓' : i + 1}
                  </div>
                  <div className="flex-1 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm cursor-pointer hover:border-brand-300 transition-colors">
                    <h3 className="text-xl font-semibold text-ink">{mod.title}</h3>
                    <div className="mt-2 text-sm text-ink-secondary prose max-w-none line-clamp-2">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{formatMarkdown(mod.explanation || '')}</ReactMarkdown>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Badge variant="outline" className="bg-ink-50">
                        {mod.tasks?.length > 0 ? `${mod.tasks.filter(t => t.completed).length} / ${mod.tasks.length} tasks` : 'Generating...'}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </PageShell>
      </>
    );
  }

  return (
    <>
      <AppHeader title="O'quv rejasi" subtitle="AI shaxsiy yo'nalish" />
      <PageShell>
        <div className="relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.3),transparent_55%)]" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-brand-400">Yangi reja</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Maqsadingizga yo&apos;l xaritasi</h2>
              <p className="mt-2 max-w-md text-sm text-white/70">
                Turn your textbooks into an interactive, step-by-step learning roadmap using AI.
              </p>
            </div>
            <Button onClick={() => setShowCreate(!showCreate)} className="shrink-0 bg-white text-ink-950 hover:bg-ink-100">
              <Plus className="mr-2 h-4 w-4" /> {showCreate ? 'Cancel' : 'Create Roadmap'}
            </Button>
          </div>
        </div>

        {showCreate && (
          <div className="mt-8 rounded-2xl border border-ink-200 bg-white p-6 shadow-sm text-ink">
            <h3 className="text-lg font-medium mb-4">Create a New Learning Path</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-ink-secondary mb-1 block">What is your goal?</label>
                <input 
                  type="text" 
                  className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  placeholder="e.g. Master Newton's Laws" 
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-secondary mb-1 block">Select Source</label>
                <select 
                  className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  value={selectedSource} 
                  onChange={(e) => setSelectedSource(e.target.value)}
                  disabled={isGenerating}
                >
                  {sources.map(s => <option key={s.filename} value={s.filename}>{s.filename}</option>)}
                </select>
              </div>
            </div>
            <Button onClick={handleCreate} disabled={isGenerating || !goal} className="mt-6 w-full bg-brand-600 hover:bg-brand-700 text-white">
              {isGenerating ? 'Analyzing source & generating...' : 'Generate Roadmap'}
            </Button>
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {roadmaps.map((r, i) => {
            const totalModules = r.data?.modules?.length || 0;
            const completedModules = r.data?.modules?.filter(m => m.tasks?.length > 0 && m.tasks.every(t => t.completed)).length || 0;
            const progress = totalModules === 0 ? 0 : Math.round((completedModules / totalModules) * 100);

            return (
              <FadeUp key={r.id} delay={i * 0.06}>
                <article className="flex h-full flex-col rounded-2xl border border-ink-200 bg-white shadow-sm cursor-pointer hover:border-brand-400 transition-colors" onClick={() => setActiveRoadmap(r)}>
                  <div className="border-b border-ink-100 p-5">
                    <div className="flex justify-between items-start">
                      <Badge variant="default" className="bg-brand-50 text-brand-600 hover:bg-brand-100">{r.source_filename}</Badge>
                      <button onClick={(e) => { e.stopPropagation(); deleteRoadmap(r.id); }} className="text-ink-tertiary hover:text-red-500">🗑️</button>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold leading-snug text-ink">{r.data?.title || r.goal}</h3>
                    {r.status === 'generating' && <span className="mt-2 text-xs text-orange-500">⏳ AI is generating path...</span>}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-ink-secondary">Progress</span>
                      <span className="text-ink">{progress}%</span>
                    </div>
                    <Progress value={progress} className="mt-2" />
                    <p className="mt-4 text-sm text-ink-secondary">{totalModules} Modules</p>
                    <div className="mt-auto pt-4">
                      <Button variant="outline" className="w-full gap-2 border-ink-200 text-ink hover:bg-ink-50">
                        Davom etish <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
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

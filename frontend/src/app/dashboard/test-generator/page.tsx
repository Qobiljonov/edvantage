'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Check, ArrowLeft, ArrowRight, RefreshCcw, Trophy } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { PageShell } from '@/components/shared/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const types = ['DTM', 'Maktab', 'Fan'];
const subjects = ['Matematika', 'Fizika', 'Kimyo', 'Biologiya', 'Ona tili', 'Ingliz tili', 'Tarix'];
const levels = ['Oson', "O'rta", 'Qiyin', 'DTM darajasi'];
const API_BASE = 'http://127.0.0.1:8000';

type Source = { filename: string; status: string; is_active: boolean };
type Question = { q: string; options: string[]; answer: number };

export default function TestGeneratorPage() {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [type, setType] = useState(types[0]);
  const [subject, setSubject] = useState(subjects[0]);
  const [level, setLevel] = useState(levels[2]);
  const [count, setCount] = useState(15);
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState('Barchasi');
  const [errorMsg, setErrorMsg] = useState('');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/sources`)
      .then(res => res.json())
      .then(data => setSources(data))
      .catch(console.error);
  }, []);

  const generate = async () => {
    setLoading(true);
    setGenerated(false);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/tests/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_filename: selectedSource === 'Barchasi' ? null : selectedSource,
          type,
          subject,
          level,
          count
        })
      });
      if (!res.ok) throw new Error('API xatosi');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.questions || data.questions.length === 0) throw new Error("Savollar yaratilmadi");
      setQuestions(data.questions);
      setGenerated(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentIndex(0);
    setAnswers({});
    setShowResults(false);
  };

  const handleSelectOption = (optIdx: number) => {
    setAnswers({ ...answers, [currentIndex]: optIdx });
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const resetGenerator = () => {
    setQuizStarted(false);
    setGenerated(false);
    setQuestions([]);
  };

  const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active ? 'bg-ink-950 text-white' : 'bg-ink-50 text-ink-secondary hover:bg-ink-100'
      }`}
    >
      {children}
    </button>
  );

  if (quizStarted) {
    if (showResults) {
      const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
      const percentage = Math.round((score / questions.length) * 100);
      return (
        <>
          <AppHeader title="Test Natijalari" subtitle={`${subject} · ${level}`} />
          <PageShell>
            <div className="max-w-3xl mx-auto mt-8">
              <Card className="text-center p-12">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-brand-50 mb-6">
                  <Trophy className="h-12 w-12 text-brand-600" aria-hidden />
                </div>
                <h2 className="text-4xl font-bold text-ink mb-2">{percentage}%</h2>
                <p className="text-lg text-ink-secondary mb-8">Siz {questions.length} ta savoldan {score} tasiga to'g'ri javob berdingiz.</p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={startQuiz}>Qaytadan ishlash</Button>
                  <Button variant="primary" onClick={resetGenerator}>Yangi test yaratish</Button>
                </div>
              </Card>

              <div className="mt-12 space-y-6">
                <h3 className="text-xl font-semibold text-ink">To'g'ri javoblar</h3>
                {questions.map((q, i) => {
                  const isCorrect = answers[i] === q.answer;
                  return (
                    <div key={i} className={`p-6 rounded-2xl border ${isCorrect ? 'border-teal-200 bg-teal-50' : 'border-red-200 bg-red-50'}`}>
                      <p className="font-medium text-ink mb-4">{i + 1}. {q.q}</p>
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          let bg = 'bg-white border border-ink-100 text-ink-secondary';
                          if (optIdx === q.answer) bg = 'bg-teal-500 border-teal-600 text-white font-medium';
                          else if (optIdx === answers[i] && !isCorrect) bg = 'bg-red-500 border-red-600 text-white font-medium';
                          return (
                            <div key={optIdx} className={`px-4 py-3 rounded-xl text-sm ${bg}`}>
                              {String.fromCharCode(65 + optIdx)}. {opt}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </PageShell>
        </>
      );
    }

    const q = questions[currentIndex];
    const hasAnswered = answers[currentIndex] !== undefined;

    return (
      <>
        <AppHeader title="Test jarayoni" subtitle={`${currentIndex + 1} / ${questions.length} savol`} />
        <PageShell>
          <div className="max-w-3xl mx-auto mt-4">
            <div className="flex items-center gap-4 mb-8">
              <Progress value={((currentIndex + 1) / questions.length) * 100} className="flex-1" />
              <span className="text-sm font-semibold text-ink-secondary">{currentIndex + 1}/{questions.length}</span>
            </div>
            
            <Card className="min-h-[400px] flex flex-col">
              <CardContent className="flex-1 p-8">
                <h2 className="text-xl font-semibold text-ink leading-relaxed mb-8">{currentIndex + 1}. {q.q}</h2>
                <div className="space-y-3">
                  {q.options.map((opt, i) => {
                    const isSelected = answers[currentIndex] === i;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectOption(i)}
                        className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all ${
                          isSelected ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium' : 'border-ink-100 bg-white hover:border-brand-200 hover:bg-brand-50/30 text-ink-secondary'
                        }`}
                      >
                        <span className="inline-block w-8 font-semibold opacity-60">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
              <div className="border-t border-ink-100 p-6 flex justify-between bg-ink-50 rounded-b-xl">
                <Button variant="outline" onClick={() => resetGenerator()}>To'xtatish</Button>
                <Button variant="primary" onClick={nextQuestion} disabled={!hasAnswered} className="gap-2">
                  {currentIndex < questions.length - 1 ? 'Keyingisi' : 'Natijani ko\'rish'} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </PageShell>
      </>
    );
  }

  return (
    <>
      <AppHeader title="AI Test generatori" subtitle="Milliy standartlarga mos savollar" />
      <PageShell>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Parametrlar</CardTitle>
              <p className="text-2xs text-ink-tertiary">AI sizning manbalaringiz asosida test yaratadi</p>
            </CardHeader>
            <CardContent className="space-y-8">
              <fieldset>
                <legend className="label-caps mb-3">Manba (Source)</legend>
                <select
                  className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                >
                  <option value="Barchasi">Barcha faol manbalar</option>
                  {sources.filter(s => s.status === 'ready').map(s => (
                    <option key={s.filename} value={s.filename}>{s.filename}</option>
                  ))}
                </select>
              </fieldset>
              <fieldset>
                <legend className="label-caps mb-3">Test turi</legend>
                <div className="flex flex-wrap gap-2">
                  {types.map((t) => (
                    <Chip key={t} active={type === t} onClick={() => setType(t)}>{t}</Chip>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="label-caps mb-3">Fan</legend>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <Chip key={s} active={subject === s} onClick={() => setSubject(s)}>{s}</Chip>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="label-caps mb-3">Murakkablik</legend>
                <div className="flex flex-wrap gap-2">
                  {levels.map((l) => (
                    <Chip key={l} active={level === l} onClick={() => setLevel(l)}>{l}</Chip>
                  ))}
                </div>
              </fieldset>
              <div>
                <div className="flex justify-between">
                  <span className="label-caps">Savollar soni (Maks: 15)</span>
                  <span className="text-sm font-semibold tabular-nums">{count}</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={15}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="mt-3 w-full accent-brand-600"
                />
              </div>
              {errorMsg && <p className="text-sm text-red-500 font-medium">{errorMsg}</p>}
              <Button
                variant="primary"
                className="w-full gap-2"
                onClick={generate}
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Generatsiya...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Test yaratish</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Natija</CardTitle>
            </CardHeader>
            <CardContent>
              {!generated && !loading && (
                <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-50">
                    <Sparkles className="h-7 w-7 text-ink-300" aria-hidden />
                  </div>
                  <p className="mt-4 text-sm text-ink-tertiary">Parametrlarni tanlang va yarating</p>
                </div>
              )}
              {loading && (
                <div className="flex min-h-[320px] flex-col items-center justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
                  <p className="mt-4 text-sm text-ink-secondary">AI {count} ta savol yaratmoqda...</p>
                  <p className="mt-1 text-xs text-ink-tertiary">Bu jarayon 10-30 soniya vaqt olishi mumkin</p>
                </div>
              )}
              {generated && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl bg-teal-500/10 p-4 ring-1 ring-teal-500/20">
                    <Check className="h-5 w-5 text-teal-600" aria-hidden />
                    <div>
                      <p className="text-sm font-semibold text-ink">Tayyor</p>
                      <p className="text-2xs text-ink-tertiary">
                        {subject} · {type} · {level}
                      </p>
                    </div>
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                    {questions.slice(0, 3).map((q, i) => (
                      <div key={i} className="rounded-xl surface-inset p-4">
                        <p className="text-sm font-medium text-ink">Savol {i + 1}</p>
                        <p className="mt-1 text-2xs text-ink-tertiary line-clamp-2">
                          {q.q}
                        </p>
                      </div>
                    ))}
                    {questions.length > 3 && (
                      <div className="text-center py-2 text-xs text-ink-tertiary">
                        + yana {questions.length - 3} ta savol
                      </div>
                    )}
                  </div>
                  
                  <Badge variant="success">{questions.length} savol yaratildi</Badge>
                  <Button variant="primary" className="w-full" onClick={startQuiz}>
                    Testni boshlash
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageShell>
    </>
  );
}

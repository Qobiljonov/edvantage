import type { Book } from './types';

/** Simulated RAG pipeline — production da PDF parser + vector DB */
export async function processUploadedBook(
  fileName: string,
  fileSize: number
): Promise<{ book: Book; pipeline: PipelineStep[] }> {
  const steps: PipelineStep[] = [
    { step: 'extract', status: 'done', message: 'PDF matni Markdown ga ajratildi' },
    { step: 'enrich', status: 'done', message: 'Rasmlar tavsifga aylantirildi (simulyatsiya)' },
    {
      step: 'chunk',
      status: 'done',
      message: `${Math.floor(fileSize / 500) + 80} ta chunk yaratildi`,
    },
    { step: 'vector', status: 'done', message: 'Vektor bazasiga indekslandi' },
    { step: 'roadmap', status: 'done', message: 'Unit va darslar avtomatik tuzildi' },
  ];

  await delay(1200);

  const id = `book-${Date.now()}`;
  const baseName = fileName.replace(/\.(pdf|epub)$/i, '');

  const book: Book = {
    id,
    title: baseName,
    author: 'Yuklangan material',
    coverColor: 'from-emerald-600 to-teal-800',
    uploadedAt: new Date().toISOString().slice(0, 10),
    chunksCount: Math.floor(fileSize / 400) + 120,
    markdownPreview: `# ${baseName}\n\n## 1.1 Kirish\n\nMaterial muvaffaqiyatli qayta ishlandi.\n\n## 1.2 Asosiy tushunchalar\n\nAI ushbu bo'limdan testlar yaratadi.`,
    units: [
      {
        id: `${id}-u1`,
        number: 1,
        title: 'Unit 1',
        progress: 0,
        lessons: [
          { id: `${id}-u1-l1`, code: '1.1', title: 'Kirish va asoslar', status: 'available' },
          { id: `${id}-u1-l2`, code: '1.2', title: 'Asosiy tushunchalar', status: 'locked' },
          { id: `${id}-u1-l3`, code: '1.3', title: 'Amaliy mashqlar', status: 'locked' },
        ],
      },
      {
        id: `${id}-u2`,
        number: 2,
        title: 'Unit 2',
        progress: 0,
        lessons: [
          { id: `${id}-u2-l1`, code: '2.1', title: 'Chuqurroq mavzu', status: 'locked' },
          { id: `${id}-u2-l2`, code: '2.2', title: 'Mustahkamlash', status: 'locked' },
        ],
      },
      {
        id: `${id}-u3`,
        number: 3,
        title: 'Unit 3',
        progress: 0,
        lessons: [
          {
            id: `${id}-u3-l1`,
            code: '3.1',
            title: 'Yakuniy testga tayyorgarlik',
            status: 'locked',
          },
        ],
      },
    ],
  };

  return { book, pipeline: steps };
}

export interface PipelineStep {
  step: string;
  status: 'pending' | 'running' | 'done' | 'error';
  message: string;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function computeBookProgress(book: Book): number {
  const all = book.units.flatMap((u) => u.lessons);
  if (!all.length) return 0;
  const done = all.filter((l) => l.status === 'completed').length;
  return Math.round((done / all.length) * 1000) / 10;
}

export function getJuneProgressLabel(book: Book): string {
  return `Iyun progressi: ${computeBookProgress(book)}%`;
}

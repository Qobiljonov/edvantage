import type { AppState, Book, QuizQuestion } from './types';

function makeUnits(prefix: string, titles: string[][]): Book['units'] {
  return titles.map((lessons, ui) => ({
    id: `${prefix}-u${ui + 1}`,
    number: ui + 1,
    title: `Unit ${ui + 1}`,
    progress: ui === 0 ? 73.6 : ui === 1 ? 45 : 0,
    lessons: lessons.map((title, li) => ({
      id: `${prefix}-u${ui + 1}-l${li + 1}`,
      code: `${ui + 1}.${li + 1}`,
      title,
      status: ui === 0 && li < 2 ? 'completed' : ui === 0 && li === 2 ? 'available' : 'locked',
      completedAt: ui === 0 && li < 2 ? '2026-06-01' : undefined,
    })),
  }));
}

export const DEMO_BOOKS: Book[] = [
  {
    id: 'book-english-1',
    title: 'English File Elementary',
    author: 'Oxford',
    coverColor: 'from-violet-600 to-indigo-800',
    uploadedAt: '2026-05-15',
    chunksCount: 1240,
    units: makeUnits('en1', [
      ['Salomlashish', 'Raqamlar va vaqt', "Oila va do'stlar", 'Kundalik rutin'],
      ['Ovqat va ichimlik', "Shahar va yo'nalish", 'Xarid qilish'],
      ['Sayohat', 'Mehmonxona', 'Aeroport'],
    ]),
  },
  {
    id: 'book-dtm-math',
    title: "DTM Matematika Qo'llanma",
    author: 'Milliy dastur',
    coverColor: 'from-rose-600 to-orange-700',
    uploadedAt: '2026-05-28',
    chunksCount: 890,
    units: makeUnits('math', [
      ['Algebra asoslari', 'Kvadrat tenglamalar', 'Funksiyalar'],
      ['Geometriya', 'Trigonometriya', 'Vektorlar'],
      ['Ehtimollar', 'Statistika'],
    ]),
  },
];

export const INITIAL_STATE: AppState = {
  user: {
    id: 'user-1',
    name: 'Umidjon Qobiljonov',
    email: 'sardor@learn.uz',
    avatar: 'SK',
    level: 'Beginner',
    branch: 'Toshkent — Chilonzor',
    rank: 47,
    coins: 1250,
    scores: 3840,
    subscriptionBalance: -666000,
    subscriptionDueDate: '2026-06-15',
    isSubscribed: false,
  },
  books: DEMO_BOOKS,
  activeBookId: 'book-english-1',
  recap: [
    {
      id: 'r1',
      title: 'Yangi AI test rejimi',
      subtitle: "Practice bo'limi yangilandi",
      imageGradient: 'from-purple-600 to-pink-600',
    },
    {
      id: 'r2',
      title: 'Coin Shop ochildi',
      subtitle: 'Mukofotlarni bugun oling',
      imageGradient: 'from-cyan-600 to-blue-700',
    },
    {
      id: 'r3',
      title: 'Iyun chellenji',
      subtitle: '73.6% — davom eting!',
      imageGradient: 'from-amber-500 to-rose-600',
    },
  ],
  payments: [
    { id: 'p1', date: '2026-05-01', amount: 666000, status: 'paid' },
    { id: 'p2', date: '2026-04-01', amount: 666000, status: 'paid' },
  ],
  giftShop: [
    {
      id: 'g1',
      name: 'Premium tema',
      cost: 500,
      icon: '🎨',
      description: "Qorong'u va yorqin tema",
    },
    { id: 'g2', name: 'AI bonus', cost: 800, icon: '⚡', description: '+50 AI savol' },
    {
      id: 'g3',
      name: 'Streak himoya',
      cost: 300,
      icon: '🛡️',
      description: '1 kunlik streak saqlash',
    },
    {
      id: 'g4',
      name: 'Sertifikat',
      cost: 1200,
      icon: '📜',
      description: 'Unit tugatish sertifikati',
    },
  ],
  purchasedGifts: [],
};

export function generateQuizForUnit(book: Book, unitId: string): QuizQuestion[] {
  const unit = book.units.find((u) => u.id === unitId) ?? book.units[0];
  const lesson = unit.lessons.find((l) => l.status !== 'locked') ?? unit.lessons[0];
  const topic = lesson?.title ?? unit.title;

  return [
    {
      id: `q-${unitId}-1`,
      type: 'mcq',
      unitId: unit.id,
      lessonId: lesson.id,
      question: `"${topic}" mavzusida: To'g'ri javobni tanlang — asosiy tushuncha qaysi?`,
      options: [
        "Mavzuga mos asosiy ta'rif",
        "Boshqa fan bo'limi",
        'Eski unit materiali',
        'Umumiy grammatika qoidasi',
      ],
      correctIndex: 0,
    },
    {
      id: `q-${unitId}-2`,
      type: 'mcq',
      unitId: unit.id,
      lessonId: lesson.id,
      question: `${topic} bo'yicha qaysi usul eng samarali o'rganish yo'li?`,
      options: ['Amaliyot va testlar', "Faqat o'qish", "Videoni o'tkazib yuborish", 'Hech biri'],
      correctIndex: 0,
    },
    {
      id: `q-${unitId}-3`,
      type: 'qa',
      unitId: unit.id,
      lessonId: lesson.id,
      question: `"${topic}" mavzusini o'z so'zlaringiz bilan qisqacha tushuntiring.`,
      sampleAnswer: "Mavzu bo'yicha asosiy g'oya va misollar.",
    },
  ];
}

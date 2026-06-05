export const student = {
  name: 'Umidjon Qobiljonov',
  grade: '11-sinf',
  school: 'Toshkent №45 maktab',
  avatar: 'SK',
  xp: 12450,
  level: 18,
  streak: 23,
  rank: { school: 3, region: 47, national: 892 },
  readiness: 78,
};

export const weeklyProgress = [
  { kun: 'Du', ball: 72 },
  { kun: 'Se', ball: 85 },
  { kun: 'Ch', ball: 68 },
  { kun: 'Pa', ball: 91 },
  { kun: 'Ju', ball: 78 },
  { kun: 'Sh', ball: 95 },
  { kun: 'Ya', ball: 82 },
];

export const topicsLearned = [
  { name: 'Algebra — kvadrat tenglamalar', progress: 100, subject: 'Matematika' },
  { name: 'Fizika — Nyuton qonunlari', progress: 85, subject: 'Fizika' },
  { name: 'Kimyo — organik birikmalar', progress: 60, subject: 'Kimyo' },
  { name: 'Biologiya — genetika', progress: 45, subject: 'Biologiya' },
  { name: 'Ona tili — adabiyot', progress: 90, subject: 'Ona tili' },
];

export const completedTests = [
  { name: 'DTM Matematika — 1-bosqich', score: 87, date: '3 iyun', questions: 45 },
  { name: 'Fizika — mexanika', score: 72, date: '1 iyun', questions: 30 },
  { name: 'Kimyo — asoslar', score: 91, date: '28 may', questions: 25 },
  { name: "DTM To'liq simulyatsiya", score: 78, date: '25 may', questions: 90 },
];

export const aiRecommendations = [
  {
    title: 'Zaif mavzu: Trigonometriya',
    desc: 'DTM tayyorgarligida 15% past natija. 3 kunlik mini-reja tayyor.',
    priority: 'yuqori',
  },
  {
    title: 'Kimyo — organik birikmalar',
    desc: "Mavzuni 60% o'rgandingiz. Test yaratish tavsiya etiladi.",
    priority: "o'rta",
  },
  {
    title: 'Kunlik seriyani saqlang!',
    desc: "23 kunlik seriya! Bugun kamida 30 daqiqa o'qing.",
    priority: 'past',
  },
];

export const strongTopics = [
  { name: 'Algebra', percent: 92 },
  { name: 'Ona tili', percent: 88 },
  { name: 'Geometriya', percent: 85 },
];

export const weakTopics = [
  { name: 'Trigonometriya', percent: 45 },
  { name: 'Organik kimyo', percent: 52 },
  { name: 'Elektrodinamika', percent: 58 },
];

export const rankings = {
  school: [
    { rank: 1, name: 'Dilnoza Rahimova', score: 9850, avatar: 'DR' },
    { rank: 2, name: 'Jasur Toshmatov', score: 9420, avatar: 'JT' },
    { rank: 3, name: 'Umidjon Qobiljonov', score: 12450, avatar: 'SK', isMe: true },
    { rank: 4, name: 'Malika Yusupova', score: 8900, avatar: 'MY' },
    { rank: 5, name: 'Bobur Aliyev', score: 8650, avatar: 'BA' },
  ],
  region: [
    { rank: 45, name: 'Umidjon Qobiljonov', score: 12450, avatar: 'SK', isMe: true },
    { rank: 46, name: 'Nilufar Qodirova', score: 12380, avatar: 'NQ' },
    { rank: 47, name: 'Azizbek Mirzayev', score: 12300, avatar: 'AM' },
  ],
};

export const achievements = [
  { name: 'Birinchi test', icon: '🎯', unlocked: true },
  { name: '7 kunlik seriya', icon: '🔥', unlocked: true },
  { name: 'DTM ustasi', icon: '🏆', unlocked: true },
  { name: '100 test', icon: '💎', unlocked: false },
  { name: 'Respublika TOP 100', icon: '👑', unlocked: false },
];

export const roadmaps = [
  { title: '30 kunlik DTM matematika rejasi', progress: 65, days: 30, type: 'DTM' },
  { title: 'IELTS 7.0 rejasi', progress: 40, days: 60, type: 'IELTS' },
  { title: 'Prezident maktabi tayyorgarligi', progress: 25, days: 90, type: 'PM' },
];

export const chatMessages = [
  {
    role: 'assistant',
    content: 'Salom, Sardor! Men sizning AI ustozingizman. Bugun qanday mavzuda yordam kerak?',
  },
];

export const testimonials = [
  {
    name: 'Dilnoza Rahimova',
    role: "11-sinf o'quvchisi",
    text: 'Edvantage yordamida DTM natijam 45 balldan 78 ballgacha oshdi. AI ustoz har doim yonimda!',
    school: 'Samarqand',
  },
  {
    name: 'Rustam Bekmurodov',
    role: "O'qituvchi",
    text: 'Sinfim natijalari 40% yaxshilandi. Test yaratish va tahlil qilish juda qulay.',
    school: 'Andijon',
  },
  {
    name: 'Gulnora Tosheva',
    role: 'Ota-ona',
    text: "Farzandimning o'qish jarayonini real vaqtda kuzataman. Juda ishonchli platforma.",
    school: "Farg'ona",
  },
];

export const partners = [
  "O'zbekiston Respublikasi Ta'lim vazirligi",
  'DTM',
  'Cambridge',
  'Khan Academy',
  'Toshkent Davlat Universiteti',
  'INHA',
  'WIUT',
  'PDP',
];

export const pricingPlans = [
  {
    name: 'Bepul',
    price: '0',
    period: 'oy',
    features: ['Kunlik 5 AI savol', '3 test/oy', 'Asosiy analitika', 'Kutubxona — 50 MB'],
    popular: false,
  },
  {
    name: 'Pro',
    price: '26 000',
    period: 'oy',
    features: [
      'Cheksiz AI ustoz',
      'Cheksiz testlar',
      "To'liq analitika",
      'Imtihon simulyatori',
      'Shaxsiy reja',
    ],
    popular: true,
  },
  {
    name: 'Maktab',
    price: 'Maxsus',
    period: '',
    features: [
      'Barcha Pro imkoniyatlar',
      "O'qituvchi paneli",
      'Ota-ona paneli',
      'Maktab reytingi',
      "24/7 qo'llab-quvvatlash",
    ],
    popular: false,
  },
];

export const teacherClasses = [
  { name: '11-A sinf', students: 28, avgScore: 76, tests: 12 },
  { name: '11-B sinf', students: 26, avgScore: 82, tests: 15 },
  { name: '10-A sinf', students: 30, avgScore: 71, tests: 8 },
];

export const parentStats = {
  weeklyHours: 18.5,
  testsCompleted: 7,
  avgScore: 81,
  streak: 23,
  lastActivity: 'Bugun, 14:32',
};

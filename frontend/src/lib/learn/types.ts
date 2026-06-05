export type LessonStatus = 'locked' | 'available' | 'completed';

export interface SubLesson {
  id: string;
  code: string;
  title: string;
  status: LessonStatus;
  completedAt?: string;
}

export interface Unit {
  id: string;
  number: number;
  title: string;
  progress: number;
  lessons: SubLesson[];
}

export interface Book {
  id: string;
  title: string;
  author?: string;
  coverColor: string;
  uploadedAt: string;
  units: Unit[];
  chunksCount: number;
  markdownPreview?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'qa';
  question: string;
  options?: string[];
  correctIndex?: number;
  sampleAnswer?: string;
  unitId: string;
  lessonId: string;
}

export interface GiftItem {
  id: string;
  name: string;
  cost: number;
  icon: string;
  description: string;
}

export interface RecapItem {
  id: string;
  title: string;
  subtitle: string;
  imageGradient: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: string;
  branch: string;
  rank: number;
  coins: number;
  scores: number;
  subscriptionBalance: number;
  subscriptionDueDate: string;
  isSubscribed: boolean;
}

export interface AppState {
  user: UserProfile;
  books: Book[];
  activeBookId: string | null;
  recap: RecapItem[];
  payments: PaymentRecord[];
  giftShop: GiftItem[];
  purchasedGifts: string[];
}

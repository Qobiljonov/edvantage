'use client';

import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { AppState, Book } from './types';
import { INITIAL_STATE } from './seed';

type Action =
  | { type: 'SET_ACTIVE_BOOK'; bookId: string }
  | { type: 'ADD_BOOK'; book: Book }
  | { type: 'ADD_COINS'; amount: number }
  | { type: 'ADD_SCORE'; amount: number }
  | { type: 'PURCHASE_GIFT'; giftId: string; cost: number }
  | { type: 'PAY_SUBSCRIPTION' }
  | { type: 'COMPLETE_LESSON'; bookId: string; lessonId: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_BOOK':
      return { ...state, activeBookId: action.bookId };
    case 'ADD_BOOK':
      return {
        ...state,
        books: [action.book, ...state.books],
        activeBookId: action.book.id,
      };
    case 'ADD_COINS':
      return {
        ...state,
        user: { ...state.user, coins: state.user.coins + action.amount },
      };
    case 'ADD_SCORE':
      return {
        ...state,
        user: { ...state.user, scores: state.user.scores + action.amount },
      };
    case 'PURCHASE_GIFT': {
      if (state.user.coins < action.cost) return state;
      if (state.purchasedGifts.includes(action.giftId)) return state;
      return {
        ...state,
        user: { ...state.user, coins: state.user.coins - action.cost },
        purchasedGifts: [...state.purchasedGifts, action.giftId],
      };
    }
    case 'PAY_SUBSCRIPTION':
      return {
        ...state,
        user: {
          ...state.user,
          subscriptionBalance: 0,
          isSubscribed: true,
          subscriptionDueDate: '2026-07-15',
        },
        payments: [
          {
            id: `p-${Date.now()}`,
            date: new Date().toISOString().slice(0, 10),
            amount: 666000,
            status: 'paid',
          },
          ...state.payments,
        ],
      };
    case 'COMPLETE_LESSON': {
      const books = state.books.map((b) => {
        if (b.id !== action.bookId) return b;
        const units = b.units.map((u) => {
          const lessons = u.lessons.map((l) =>
            l.id === action.lessonId
              ? {
                  ...l,
                  status: 'completed' as const,
                  completedAt: new Date().toISOString().slice(0, 10),
                }
              : l
          );
          const completed = lessons.filter((l) => l.status === 'completed').length;
          const progress = lessons.length ? (completed / lessons.length) * 100 : 0;
          return { ...u, lessons, progress: Math.round(progress * 10) / 10 };
        });
        return { ...b, units };
      });
      return { ...state, books };
    }
    default:
      return state;
  }
}

interface LearnContextValue {
  state: AppState;
  activeBook: Book | null;
  setActiveBook: (id: string) => void;
  addBook: (book: Book) => void;
  addCoins: (n: number) => void;
  addScore: (n: number) => void;
  purchaseGift: (giftId: string, cost: number) => void;
  paySubscription: () => void;
  completeLesson: (lessonId: string) => void;
}

const LearnContext = createContext<LearnContextValue | null>(null);

export function LearnProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const activeBook = state.books.find((b) => b.id === state.activeBookId) ?? state.books[0] ?? null;

  const setActiveBook = useCallback((id: string) => {
    dispatch({ type: 'SET_ACTIVE_BOOK', bookId: id });
  }, []);

  const addBook = useCallback((book: Book) => {
    dispatch({ type: 'ADD_BOOK', book });
  }, []);

  const addCoins = useCallback((n: number) => {
    dispatch({ type: 'ADD_COINS', amount: n });
  }, []);

  const addScore = useCallback((n: number) => {
    dispatch({ type: 'ADD_SCORE', amount: n });
  }, []);

  const purchaseGift = useCallback((giftId: string, cost: number) => {
    dispatch({ type: 'PURCHASE_GIFT', giftId, cost });
  }, []);

  const paySubscription = useCallback(() => {
    dispatch({ type: 'PAY_SUBSCRIPTION' });
  }, []);

  const completeLesson = useCallback(
    (lessonId: string) => {
      if (!state.activeBookId) return;
      dispatch({
        type: 'COMPLETE_LESSON',
        bookId: state.activeBookId,
        lessonId,
      });
    },
    [state.activeBookId]
  );

  return (
    <LearnContext.Provider
      value={{
        state,
        activeBook,
        setActiveBook,
        addBook,
        addCoins,
        addScore,
        purchaseGift,
        paySubscription,
        completeLesson,
      }}
    >
      {children}
    </LearnContext.Provider>
  );
}

export function useLearn() {
  const ctx = useContext(LearnContext);
  if (!ctx) throw new Error('useLearn must be used within LearnProvider');
  return ctx;
}

import { NextResponse } from 'next/server';
import { DEMO_BOOKS, generateQuizForUnit } from '@/lib/learn/seed';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get('bookId');
  const unitId = searchParams.get('unitId');

  const book = DEMO_BOOKS.find((b) => b.id === bookId) ?? DEMO_BOOKS[0];
  const uid = unitId ?? book.units[0]?.id;

  if (!uid) {
    return NextResponse.json({ error: 'Unit topilmadi' }, { status: 404 });
  }

  const questions = generateQuizForUnit(book, uid);
  return NextResponse.json({ questions, bookId: book.id, unitId: uid });
}

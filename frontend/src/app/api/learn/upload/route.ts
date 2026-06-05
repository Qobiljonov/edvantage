import { NextResponse } from 'next/server';
import { processUploadedBook } from '@/lib/learn/rag';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 400 });
    }

    const allowed = ['application/pdf', 'application/epub+zip'];
    const ext = file.name.toLowerCase();
    if (!allowed.some((t) => file.type === t) && !ext.endsWith('.pdf') && !ext.endsWith('.epub')) {
      return NextResponse.json({ error: 'Faqat PDF yoki EPUB qabul qilinadi' }, { status: 400 });
    }

    const { book, pipeline } = await processUploadedBook(file.name, file.size);

    return NextResponse.json({ book, pipeline });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Yuklash xatosi' }, { status: 500 });
  }
}

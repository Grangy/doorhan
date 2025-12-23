import { NextResponse } from 'next/server';

export async function GET() {
  // Возвращаем пустой ответ для service worker запросов
  return new NextResponse('', { 
    status: 204,
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}



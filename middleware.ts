import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedIPs = ['93.183.91.172', '91.210.178.134']; // ← замени на свои

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Проверка только для /admin и подстраниц
  if (pathname.startsWith('/admin')) {
    // Получаем IP из заголовка (работает на Vercel, с proxy и т.п.)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIP = forwardedFor?.split(',')[0].trim();

    if (!clientIP || !allowedIPs.includes(clientIP)) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

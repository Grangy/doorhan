import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedIPs = ['93.183.91.172', '91.210.178.134', '147.45.210.105', '147.45.210.104']; // ← замени на свои

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Проверка для /admin, /create, /create1, /create2, /create3, /create4, /create5 и их подстраниц
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/create') ||
    pathname.startsWith('/create1') ||
    pathname.startsWith('/create2') ||
    pathname.startsWith('/create3') ||
    pathname.startsWith('/create4') ||
    pathname.startsWith('/create5')
  ) {
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
  matcher: [
    '/admin/:path*',
    '/create/:path*',
    '/create1/:path*',
    '/create2/:path*',
    '/create3/:path*',
    '/create4/:path*',
    '/create5/:path*'
  ],
};
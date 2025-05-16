import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Указываем страницы, которые нужно защитить
const protectedPaths = ['/admin', '/create', '/create2', '/create3', '/create4', '/create5'];

export const config = {
  matcher: protectedPaths,
};

// Указываем, что это edge-функция, чтобы работал fetch
export const runtime = 'edge';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Проверяем, относится ли путь к защищённым
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (!isProtected) {
    return NextResponse.next();
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  const clientIP = forwardedFor?.split(',')[0].trim();

  if (!clientIP) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  try {
    const geoRes = await fetch(`https://ipapi.co/${clientIP}/json/`);
    const geoData = await geoRes.json();

    if (geoData.country !== 'RU') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  } catch (e) {
    // Если API не ответил — редиректим на главную
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

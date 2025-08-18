// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Разрешённые IP
const allowedIPs = new Set([
  '2a12:bec4:150:65::2',
  '185.15.38.74',
]);

export function middleware(req: NextRequest) {
  // Пытаемся определить IP
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');

  // Берём первый IP из списка x-forwarded-for (если несколько)
  const ip =
    forwardedFor?.split(',')[0].trim() ||
    realIp ||
    undefined;

  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!ip || !allowedIPs.has(ip)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

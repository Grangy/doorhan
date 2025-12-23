// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Разрешённые IP для старой админки NextAdmin
const allowedIPs = new Set([
  '2a12:bec4:150:65::2',
  '185.15.38.74',
]);

export function middleware(req: NextRequest) {
  // Защита старой админки NextAdmin (только для /admin/[[...nextadmin]])
  if (req.nextUrl.pathname.startsWith('/admin/[[...nextadmin]]') || req.nextUrl.pathname.startsWith('/api/admin')) {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0].trim() || realIp || undefined;

    if (!ip || !allowedIPs.has(ip)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  // Новая админ панель защищена NextAuth, не блокируем здесь
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

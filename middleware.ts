import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// メモリベースのレート制限
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export async function middleware(request: NextRequest) {
  // API routesのみに適用
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const ip = request.ip ?? '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1分
  const maxRequests = 10;
  
  const requestData = requestCounts.get(ip);
  
  if (!requestData || now > requestData.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
  } else if (requestData.count >= maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  } else {
    requestData.count++;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
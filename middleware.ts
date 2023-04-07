import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.toLowerCase().startsWith('/pointbuy')) {
    return NextResponse.rewrite(new URL('/PointBuy', request.url));
  }
  return request;
}

export default middleware;

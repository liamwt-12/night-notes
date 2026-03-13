import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Only protect the old app routes - landing page always shows
  const protectedPaths = ['/app', '/ritual', '/insights', '/settings', '/morning', '/complete']
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

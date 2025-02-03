import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Add custom headers or modify the request/response here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Must have a token to access protected routes
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  },
);

export const config = {
  matcher: [
    // Protected routes that require authentication
    '/chat/:path*',
    '/documents/:path*',
    '/settings/:path*',
    // Exclude public routes and static files
    '/((?!api|_next/static|_next/image|favicon.ico|login|register).*)',
  ],
};

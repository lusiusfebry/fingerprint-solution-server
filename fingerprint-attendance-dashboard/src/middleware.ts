import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Basic check for auth token in cookies. 
    // Note: The primary auth state is managed by AuthContext via localStorage.
    // This middleware provides a layer of protection if cookies are used in the future.

    const token = request.cookies.get('token')?.value;
    const isLoginPage = request.nextUrl.pathname === '/login';

    if (!token && !isLoginPage) {
        // Ideally redirect to login, but since we rely on localStorage, 
        // we allow correct routing and let Client Component handle the redirect.
        // return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};

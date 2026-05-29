// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Explicitly mark /landing, sign-in, and sign-up as completely public routes
const isPublicRoute = createRouteMatcher([
  '/landing', 
  '/sign-in(.*)', 
  '/sign-up(.*)'
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    // Calling protect() directly inline on the auth utility allows Clerk 
    // to cleanly inject server-side redirect headers instantly.
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html|css|js|gif|svg|png|jpg|jpeg|webp|woff2?|ico)$).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
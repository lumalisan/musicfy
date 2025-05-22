import { clerkMiddleware } from '@clerk/astro/server';

// Apply Clerk middleware to all routes
export const onRequest = clerkMiddleware();

// Configure the matcher to apply middleware to all routes except static assets
export const config = {
  matcher: [
    '/((?!_astro|favicon.ico|robots.txt|sitemap.xml|images|assets|.*\\..{2,5}$).+)',
  ],
};

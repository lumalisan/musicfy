import { clerkMiddleware } from '@clerk/astro/server';

// Check if a route is private (requires authentication)
const isPrivateRoute = (request: Request): boolean => {
  const url = new URL(request.url);
  // Only /library and its subroutes are private
  return url.pathname === '/library' || url.pathname.startsWith('/library/');
};

// Apply Clerk middleware to all routes
export const onRequest = clerkMiddleware((auth, context) => {
  if (isPrivateRoute(context.request)) {
    return auth().redirectToSignIn();
  }
  // For public routes, return undefined to continue to the next middleware or route handler
  return undefined;
});

// Configure the matcher to apply middleware to all routes except static assets
export const config = {
  matcher: [
    '/((?!_astro|favicon.ico|robots.txt|sitemap.xml|images|assets|.*\\..{2,5}$).*)',
  ],
};

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
    '/profile' // Add any additional routes here
]); // Update clerkMiddleware to manually protect routes

export default clerkMiddleware((auth, req) => {
    if (isProtectedRoute(req)) {
        auth().protect(); // Protect the route if it matches the defined criteria
    }
});

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
};

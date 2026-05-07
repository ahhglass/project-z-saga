// Prerender the home page so it's served as static HTML on Vercel.
// Avoids SSR in serverless when opening the site from mobile (can fix 500/404 on first load).
export const prerender = true;

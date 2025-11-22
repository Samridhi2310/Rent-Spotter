// app/api/proxy/[...path]/route.js
const BACKEND_URL = "https://rent-spotter-new.onrender.com";  // ← Updated to your new backend

export const dynamic = "force-dynamic";

async function handler(req) {
  const url = new URL(req.url);
  const backendPath = url.pathname.replace(/^\/api\/proxy/, "") + url.search;  // Strips /api/proxy correctly
  const targetUrl = `${BACKEND_URL}${backendPath}`;

  console.log(`Proxying: ${req.url} → ${targetUrl}`);  // Debug log (check Vercel Functions tab)

  const response = await fetch(targetUrl, {
    method: req.method,
    headers: {
      ...Object.fromEntries(req.headers),
      host: new URL(BACKEND_URL).host,
    },
    body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : null,
  });

  const newHeaders = new Headers(response.headers);
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) newHeaders.set("set-cookie", setCookie);

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  });
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
// app/api/proxy/[...path]/route.js
const BACKEND_URL = "https://rent-spotter-backend.onrender.com";  // ← double-check this is your exact Render URL

export const dynamic = 'force-dynamic';

export async function GET(request) {
  return proxy(request);
}
export async function POST(request) {
  return proxy(request);
}
export async function PUT(request) {
  return proxy(request);
}
export async function DELETE(request) {
  return proxy(request);
}

async function proxy(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/proxy', '');  // removes /api/proxy correctly
  const targetUrl = BACKEND_URL + path + url.search;

  const response = await fetch(targetUrl, {
    method: request.method,
    headers: {
      ...Object.fromEntries(request.headers),
      host: new URL(BACKEND_URL).host,
    },
    body: request.method !== 'GET' ? await request.text() : undefined,
  });

  const newHeaders = new Headers(response.headers);
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) newHeaders.set('set-cookie', setCookie);

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  });
}
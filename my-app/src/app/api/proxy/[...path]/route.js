// app/api/proxy/[...path]/route.js
export async function GET(request, { params }) {
  return proxyRequest(request);
}

export async function POST(request, { params }) {
  return proxyRequest(request);
}

export async function PUT(request, { params }) {
  return proxyRequest(request);
}

export async function PATCH(request, { params }) {
  return proxyRequest(request);
}

export async function DELETE(request, { params }) {
  return proxyRequest(request);
}

async function proxyRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/proxy/', '/api/');
  const backendUrl = `https://rent-spotter-backend.onrender.com${path}${url.search}`;

  const response = await fetch(backendUrl, {
    method: request.method,
    headers: {
      ...Object.fromEntries(request.headers.entries()),
      host: new URL(backendUrl).host,
    },
    body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
  });

  // Forward set-cookie from backend
  const setCookie = response.headers.get('set-cookie');
  const headers = new Headers(response.headers);
  if (setCookie) {
    headers.set('set-cookie', setCookie);
  }

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
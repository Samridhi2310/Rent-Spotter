// app/api/proxy/[...path]/route.js   ←←← EXACT PATH
const BACKEND_URL = "https://rent-spotter-backend.onrender.com"   // ← your real Render URL

export const dynamic = "force-dynamic"

async function handler(req) {
  const url = new URL(req.url)
  // Remove "/api/proxy" from the path
  const backendPath = url.pathname.replace(/^\/api\/proxy/, "") + url.search

  const targetUrl = `${BACKEND_URL}${backendPath}`

  const response = await fetch(targetUrl, {
    method: req.method,
    headers: {
      ...Object.fromEntries(req.headers),
      host: new URL(BACKEND_URL).host,
    },
    body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
  })

  // Forward set-cookie headers
  const newHeaders = new Headers(response.headers)
  const setCookie = response.headers.get("set-cookie")
  if (setCookie) newHeaders.set("set-cookie", setCookie)

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  })
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE }
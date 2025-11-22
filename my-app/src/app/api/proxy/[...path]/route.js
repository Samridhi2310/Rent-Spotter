// THIS WORKS 1000000% — copy-paste exactly
export const dynamic = "force-dynamic"

export async function GET(req) {
  return proxy(req)
}
export async function POST(req) {
  return proxy(req)
}

async function proxy(req) {
  const url = new URL(req.url)
  const path = url.pathname.replace("/api/proxy", "") + url.search
  const target = "https://rent-spotter-new.onrender.com" + path

  const res = await fetch(target, {
    method: req.method,
    headers: req.headers,
    body: req.body ? await req.text() : undefined,
  })

  const newHeaders = new Headers(res.headers)
  const cookie = res.headers.get("set-cookie")
  if (cookie) newHeaders.set("set-cookie", cookie)

  return new Response(res.body, {
    status: res.status,
    headers: newHeaders,
  })
}
const ALLOWED_HOSTS = new Set(['commons.wikimedia.org','upload.wikimedia.org']);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/img-proxy') return handleImageProxy(request, ctx);
    return env.ASSETS.fetch(request);
  }
};

async function handleImageProxy(request, ctx) {
  const reqUrl = new URL(request.url);
  const raw = reqUrl.searchParams.get('url');
  if (!raw) return new Response('Missing image URL', {status:400});
  let target;
  try { target = new URL(raw); } catch { return new Response('Invalid image URL', {status:400}); }
  if (target.protocol !== 'https:' || !ALLOWED_HOSTS.has(target.hostname)) {
    return new Response('Image host not allowed', {status:403});
  }
  const cache = caches.default;
  const cacheKey = new Request(reqUrl.toString(), request);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;
  try {
    const upstream = await fetch(target.toString(), {
      headers:{'User-Agent':'The-Four-Classics-Inquisitor/13.1','Accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'},
      redirect:'follow', cf:{cacheTtl:2592000,cacheEverything:true}
    });
    if (!upstream.ok) return new Response('Upstream image unavailable', {status:upstream.status});
    const type = upstream.headers.get('content-type') || '';
    if (!type.startsWith('image/')) return new Response('Upstream is not an image', {status:502});
    const headers = new Headers(upstream.headers);
    headers.set('Cache-Control','public, max-age=2592000, immutable');
    headers.set('Access-Control-Allow-Origin','*');
    headers.delete('set-cookie');
    const response = new Response(upstream.body,{status:200,headers});
    ctx.waitUntil(cache.put(cacheKey,response.clone()));
    return response;
  } catch (e) {
    return new Response('Image proxy temporarily unavailable',{status:502});
  }
}

const ALLOWED_HOSTS = new Set(['commons.wikimedia.org','upload.wikimedia.org']);
const COMMONS_API='https://commons.wikimedia.org/w/api.php';
const BOOK_CONFIG={
  '红楼梦':{roots:['Category:Dream of the Red Chamber','Category:Portraits of the Dream of the Red Chamber by Gai Qi','Category:增評補圖大觀瑣錄','Category:金陵十二釵正冊'],limit:250},
  '西游记':{roots:['Category:Journey to the West','Category:Journey to the West characters','Category:Journey to the West in art','Category:西游记'],limit:250},
  '三国演义':{roots:['Category:Romance of the Three Kingdoms','Category:三國志通俗演義','Category:三國演義','Category:三國志傳'],limit:250},
  '水浒传':{roots:['Category:Water Margin','Category:忠義水滸傳','Category:忠義水滸全書','Category:Water Margin in art'],limit:250}
};
const IMAGE_RE=/\.(?:jpe?g|png|webp|gif|svg)$/i;
export default {
 async fetch(request,env,ctx){
  const url=new URL(request.url);
  if(url.pathname==='/img-proxy'||url.pathname==='/_img')return handleImageProxy(request,ctx);
  if(url.pathname==='/api/visual-library-v14')return handleVisualLibrary(request,ctx);
  return env.ASSETS.fetch(request);
 }
};
async function commonsCategory(category){
 const p=new URLSearchParams({action:'query',generator:'categorymembers',gcmtitle:category,gcmtype:'file|subcat',gcmlimit:'500',prop:'imageinfo',iiprop:'url|mime',iiurlwidth:'1400',format:'json',origin:'*'});
 const r=await fetch(COMMONS_API+'?'+p.toString(),{headers:{'User-Agent':'The-Four-Classics-Inquisitor/14.0 (educational visual index)'},cf:{cacheTtl:86400,cacheEverything:true}});
 if(!r.ok)throw new Error('Commons API '+r.status);
 return r.json();
}
async function collectBook(book){
 const cfg=BOOK_CONFIG[book],queue=[...cfg.roots],visited=new Set(),files=new Map();
 while(queue.length&&files.size<cfg.limit&&visited.size<12){
  const cat=queue.shift(); if(visited.has(cat))continue; visited.add(cat);
  try{
   const data=await commonsCategory(cat); const pages=Object.values(data.query?.pages||{});
   for(const p of pages){
    if(p.ns===14&&p.title&&!visited.has(p.title)&&queue.length<80)queue.push(p.title);
    if(p.ns!==6||!p.title||!IMAGE_RE.test(p.title))continue;
    const ii=p.imageinfo?.[0]; if(!ii?.thumburl&&!ii?.url)continue;
    const key=String(p.pageid||p.title); if(files.has(key))continue;
    files.set(key,{id:`${book}-${key}`,book,title:p.title.replace(/^File:/,'').replace(/\.[^.]+$/,''),fileTitle:p.title,pageid:p.pageid,image:ii.thumburl||ii.url,original:ii.url,sourcePage:ii.descriptionurl||('https://commons.wikimedia.org/wiki/'+encodeURIComponent(p.title.replace(/ /g,'_'))),mime:ii.mime||'',category:cat});
    if(files.size>=cfg.limit)break;
   }
  }catch(e){}
 }
 return [...files.values()].slice(0,cfg.limit);
}
async function handleVisualLibrary(request,ctx){
 const reqUrl=new URL(request.url),cache=caches.default,cacheKey=new Request(reqUrl.origin+'/api/visual-library-v14?build=14.0');
 const cached=await cache.match(cacheKey); if(cached)return cached;
 const results=[];
 for(const book of Object.keys(BOOK_CONFIG))results.push(...await collectBook(book));
 const counts=Object.fromEntries(Object.keys(BOOK_CONFIG).map(b=>[b,results.filter(x=>x.book===b).length]));
 const body=JSON.stringify({version:'14.0',generatedAt:new Date().toISOString(),target:1000,total:results.length,counts,complete:Object.values(counts).every(n=>n===250),items:results});
 const response=new Response(body,{headers:{'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=86400','access-control-allow-origin':'*'}});
 ctx.waitUntil(cache.put(cacheKey,response.clone())); return response;
}
async function handleImageProxy(request,ctx){
 const reqUrl=new URL(request.url),raw=reqUrl.searchParams.get('url'); if(!raw)return new Response('Missing image URL',{status:400});
 let target; try{target=new URL(raw)}catch{return new Response('Invalid image URL',{status:400})}
 if(target.protocol!=='https:'||!ALLOWED_HOSTS.has(target.hostname))return new Response('Image host not allowed',{status:403});
 const cache=caches.default,cacheKey=new Request(reqUrl.toString(),request),cached=await cache.match(cacheKey); if(cached)return cached;
 try{
  const upstream=await fetch(target.toString(),{headers:{'User-Agent':'The-Four-Classics-Inquisitor/14.0','Accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'},redirect:'follow',cf:{cacheTtl:2592000,cacheEverything:true}});
  if(!upstream.ok)return new Response('Upstream image unavailable',{status:upstream.status});
  const type=upstream.headers.get('content-type')||''; if(!type.startsWith('image/'))return new Response('Upstream is not an image',{status:502});
  const headers=new Headers(upstream.headers); headers.set('Cache-Control','public, max-age=2592000, immutable'); headers.set('Access-Control-Allow-Origin','*'); headers.delete('set-cookie');
  const response=new Response(upstream.body,{status:200,headers}); ctx.waitUntil(cache.put(cacheKey,response.clone())); return response;
 }catch(e){return new Response('Image proxy temporarily unavailable',{status:502})}
}

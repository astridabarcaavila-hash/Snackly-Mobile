
const CACHE="snackly-v7-interactivo";
const ASSETS=[
 "./","./index.html","./offline.html","./manifest.webmanifest",
 "./icons/icon-32.png","./icons/icon-96.png","./icons/icon-180.png",
 "./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png"
];

self.addEventListener("install",event=>{
 self.skipWaiting();
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)))
});

self.addEventListener("activate",event=>{
 event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
   .then(()=>self.clients.claim())
 )
});

self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET")return;
 if(event.request.mode==="navigate"){
  event.respondWith(
   fetch(event.request).then(response=>{
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put("./index.html",copy));
    return response
   }).catch(()=>caches.match("./index.html").then(response=>response||caches.match("./offline.html")))
  );
  return
 }
 event.respondWith(
  caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
   if(response.ok){
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(event.request,copy))
   }
   return response
  }))
 )
});

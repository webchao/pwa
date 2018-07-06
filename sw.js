const cacheName = 'news-v1';//缓存版本号

//定义静态缓存列表
const staticAssets = [
  './',
  './app.js',
  './styles.css',
  './fallback.json',
  './images/fetch-dog.jpg'
];

/*
  *self: 表示 Service Worker 作用域, 也是全局变量
  *caches: 表示缓存
  *skipWaiting: 表示强制当前处在 waiting(等候) 状态的脚本进入 activate 状态
  *clients: 表示 Service Worker 接管的页面
**/
//install
 self.addEventListener('install', async function () {
  console.log(event,'install')
  const cache =   await caches.open(cacheName);
  cache.addAll(staticAssets);//获取静态缓存列表
});
//当 install完成后activate
self.addEventListener('activate', event => {
  console.log(event,'activate')
  event
  .waitUntil(self.clients.claim()
  .then(() => self.skipWaiting())
  //调用 self.skipWaiting() 方法是为了在页面更新的过程当中, 新的 Service Worker 脚本能立即激活和生效。
);
 
});
//当网络请求时的触发事件,处理动态缓存
self.addEventListener('fetch', event => {
  console.log(event,'fetch')
  const request = event.request;//最新的data
  const url = new URL(request.url);
  //判断离线缓存是否一致，如果不一致，这更新，如果一致，就执行原有的
  if (url.originurl.origin === location.origin) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});


//把最新的data替换之前的data并在当网络请求时的触发事件触发最新的data
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  return cachedResponse || fetch(request);
}

async function networkFirst(request) {
  const dynamicCache = await caches.open('news-dynamic');
  try {
    const networkResponse = await fetch(request);
    dynamicCache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (err) {
    const cachedResponse = await dynamicCache.match(request);
    return cachedResponse || await caches.match('./fallback.json');
  }
}
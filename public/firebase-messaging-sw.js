importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);
importScripts("firebase-config.js");

if (firebaseConfig) {
  firebase.initializeApp(firebaseConfig);
  console.log(
    `${new Date().toJSON()}  [firebase-messaging-sw] Initialized messaging`
  );

  firebase.messaging().setBackgroundMessageHandler(async (payload) => {
    if (payload.data.twi_message_type !== "twilio.conversations.new_message") {
      return;
    }

    const customData = await fetch(
      `/api/parse-message?string=${payload.data.twi_body}`
    ).then((res) => res.json());

    const notificationTitle = customData.conversation;
    const notificationOptions = {
      body: `${customData.user}: ${customData.message}`,
      icon: "favicon.ico",
    };

    self.registration
      .showNotification(notificationTitle, notificationOptions)
      .then(() => {
        console.log(
          `${new Date().toJSON()}  [firebase-messaging-sw] Notification shown`
        );
      })
      .catch((err) => {
        console.error(
          `${new Date().toJSON()}  [firebase-messaging-sw] Error showing notification: ${err}`
        );
      });
  });
} else {
  console.log(
    `${new Date().toJSON()}  [firebase-messaging-sw] No firebase configuration found!`
  );
}

const OFFLINE_VERSION = 1;
const CACHE_NAME = "offline";
// Customize this with a different URL if needed.
const OFFLINE_URL = "offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Setting {cache: 'reload'} in the new request will ensure that the response
      // isn't fulfilled from the HTTP cache; i.e., it will be from the network.
      await cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Enable navigation preload if it's supported.
      // See https://developers.google.com/web/updates/2017/02/navigation-preload
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );

  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // We only want to call event.respondWith() if this is a navigation request
  // for an HTML page.
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // First, try to use the navigation preload response if it's supported.
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // catch is only triggered if an exception is thrown, which is likely
          // due to a network error.
          // If fetch() returns a valid HTTP response with a response code in
          // the 4xx or 5xx range, the catch() will NOT be called.
          console.log("Fetch failed; returning offline page instead.", error);

          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse;
        }
      })()
    );
  }

  // If our if() condition is false, then this fetch handler won't intercept the
  // request. If there are any other fetch handlers registered, they will get a
  // chance to call event.respondWith(). If no fetch handlers call
  // event.respondWith(), the request will be handled by the browser as if there
  // were no service worker involvement.
});

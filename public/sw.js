/*
 * Kill-switch worker.
 *
 * The previous worker cached every successful GET response — including
 * `/api/*` JSON and private page HTML — in one Cache Storage bucket keyed
 * only by URL, and replayed it whenever the network failed. Nothing in that
 * bucket was scoped to a signed-in user, so after a sign-out or an account
 * switch a network blip could serve the previous user's tasks, journal or
 * finance data to whoever was looking at the screen. LifeOS is an online-first
 * application and never needed an offline data cache to begin with.
 *
 * Deleting the file is not enough: a worker already installed in a browser
 * keeps running until it is explicitly replaced. This replacement claims the
 * clients, empties every cache the old worker wrote, and unregisters itself,
 * so existing installations clean themselves up on their next visit.
 */
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) client.navigate(client.url);
    })(),
  );
});

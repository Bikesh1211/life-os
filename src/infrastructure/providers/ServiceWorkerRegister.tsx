"use client";

import { useEffect } from "react";

/**
 * Retires the service worker LifeOS used to ship.
 *
 * That worker cached every successful GET — private `/api/*` responses
 * included — in a bucket keyed only by URL, and replayed it on network
 * failure, so a cached response could outlive the session that fetched it.
 * `public/sw.js` is now a kill-switch that empties those caches and
 * unregisters itself; this keeps registering it so browsers that still hold
 * the old worker pick up the replacement and clean themselves up.
 *
 * Once the installed base has turned over this component and `public/sw.js`
 * can both be deleted. LifeOS is online-first and wants no worker in front of
 * its data.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      // Nothing to retire, or the browser refused it. Either way there is no
      // stale worker left to serve one user's data to another.
    });
  }, []);

  return null;
}

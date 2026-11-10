const CACHE_NAME = "glosario-lsm-v130";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./data/annotations.json",
    "./data/emoji-aliases.json"
];

self.addEventListener(
    "install",
    event => {

        event.waitUntil(
            caches.open(CACHE_NAME)
                .then(
                    cache =>
                        cache.addAll(
                            FILES_TO_CACHE
                        )
                )
        );

        self.skipWaiting();

    }
);


self.addEventListener(
    "activate",
    event => {

        event.waitUntil(
            caches.keys()
                .then(
                    cacheNames =>
                        Promise.all(
                            cacheNames
                                .filter(
                                    cacheName =>
                                        cacheName !==
                                        CACHE_NAME
                                )
                                .map(
                                    cacheName =>
                                        caches.delete(
                                            cacheName
                                        )
                                )
                        )
                )
        );

        self.clients.claim();

    }
);


// ========================================
// INTERCEPTAR SOLICITUDES
// ========================================

self.addEventListener(
    "fetch",
    event => {

        const requestURL =
            new URL(event.request.url);

        // ========================================
        // NO INTERCEPTAR SERVICIOS EXTERNOS
        // ========================================

        if (
            requestURL.origin !== self.location.origin
        ) {
            return;
        }

        // ========================================
        // GESTIONAR RECURSOS LOCALES
        // ========================================

        event.respondWith(

            caches.match(event.request)
                .then(cachedResponse => {

                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    return fetch(event.request);

                })

        );

    }
);
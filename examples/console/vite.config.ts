/**
 * `npm run example:console` — the reference console on http://localhost:5191, against the kit's own
 * source (not a build), so a change to a kit piece shows up on reload. mesh-web comes from
 * node_modules, as it would for any site.
 */

import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const kit = (path: string): string => fileURLToPath(new URL(`../../src/${path}`, import.meta.url));

export default defineConfig({
    root: fileURLToPath(new URL('.', import.meta.url)),
    server: { port: 5191, strictPort: true },
    resolve: {
        // Exact matches: the package itself, and its stylesheet, as a site imports them.
        alias: [
            { find: /^@flybyme\/mesh-web-kit$/, replacement: kit('index.ts') },
            { find: /^@flybyme\/mesh-web-kit\/kit\.css$/, replacement: kit('kit.css') },
        ],
        dedupe: ['@flybyme/mesh-web'],
    },
    // As mesh-web's test preset does: never pre-bundle the framework, so the page, the kit and the
    // site all resolve the one copy (one Router, one renderer).
    optimizeDeps: { exclude: ['@flybyme/mesh-web'] },
    appType: 'spa',
});

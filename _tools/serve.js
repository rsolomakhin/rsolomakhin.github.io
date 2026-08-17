#!/usr/bin/env node

/**
 * Local HTTP test server for rsolomakhin.github.io and optional Web Payment Handlers.
 *
 * Serves:
 * 1. The local rsolomakhin.github.io repository (merchant & feature demos).
 * 2. (Optional) A local Web Payment Handler app (e.g. web-based-payment-app-example)
 *    mounted at /pay/ when --app-dir is specified.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Root directory of the rsolomakhin.github.io repository containing merchant & feature demos
const SITE_ROOT = path.resolve(__dirname, '..');

// CLI Argument & Environment Variable Parsing
let appDir = process.env.PAYMENT_APP_DIR ? path.resolve(process.env.PAYMENT_APP_DIR) : null;
let port = parseInt(process.env.PORT || '8088', 10);

for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg === '--help' || arg === '-h') {
    console.log(`
rsolomakhin.github.io Local Test Server

Usage: node _tools/serve.js [port] [options]

Arguments:
  [port]                   Optional port number (e.g. node _tools/serve.js 9000)

Options:
  -p, --port <number>      Port to listen on (default: 8088, or PORT env var)
  -a, --app-dir <path>     Directory of a local payment handler app to mount at /pay/
                           (e.g. /path/to/web-based-payment-app-example/public).
                           If omitted, merchant demos fall back to live https://bobbucks.dev
  -h, --help               Show this help message

Environment Variables:
  PORT                     Port override (default: 8088)
  PAYMENT_APP_DIR          Path to local payment handler app directory

Examples:
  node _tools/serve.js
  node _tools/serve.js 9000
  node _tools/serve.js --app-dir ../web-based-payment-app-example/public
`);
    process.exit(0);
  } else if (arg === '-p' || arg === '--port') {
    port = parseInt(process.argv[++i], 10);
  } else if (arg.startsWith('--port=')) {
    port = parseInt(arg.split('=')[1], 10);
  } else if (arg === '-a' || arg === '--app-dir') {
    appDir = path.resolve(process.argv[++i]);
  } else if (arg.startsWith('--app-dir=')) {
    appDir = path.resolve(arg.split('=')[1]);
  } else if (!isNaN(parseInt(arg, 10))) {
    // Positional port argument (e.g. node _tools/serve.js 8088)
    port = parseInt(arg, 10);
  }
}

// Validate custom payment handler directory if supplied
let PAYMENT_APP_ROOT = null;
if (appDir) {
  if (fs.existsSync(appDir) && fs.statSync(appDir).isDirectory()) {
    PAYMENT_APP_ROOT = appDir;
  } else {
    console.error(`❌ Error: Specified payment app directory does not exist or is not a directory: "${appDir}"`);
    process.exit(1);
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

/**
 * Transforms static HTML and JavaScript file contents before serving.
 *
 * 1. Rewrites production https://rsolomakhin.github.io URLs to the local server origin
 *    so all demo links stay on localhost.
 * 2. If a local payment handler is mounted (--app-dir), rewrites https://bobbucks.dev/pay
 *    to the local payment method URL. If not mounted, leaves https://bobbucks.dev intact
 *    so demos use the live production payment handler.
 *
 * @param {string} contentStr - Raw file content.
 * @param {string|null} localPaymentMethodUrl - Local payment method URL (null if not mounted).
 * @param {string} origin - Local server origin (e.g. http://localhost:8088).
 * @return {string} Transformed content string.
 */
function transformContent(contentStr, localPaymentMethodUrl, origin) {
  let str = contentStr;
  if (localPaymentMethodUrl) {
    str = str.replace(/https:\/\/bobbucks\.dev\/pay/g, localPaymentMethodUrl);
    str = str.replace(/https:\/\/bobbucks\.dev/g, origin);
  }
  str = str.replace(/https:\/\/rsolomakhin\.github\.io/g, origin);
  str = str.replace(/http:\/\/rsolomakhin\.github\.io/g, origin);
  return str;
}

const server = http.createServer((req, res) => {
  const host = req.headers.host || `localhost:${port}`;
  const origin = `http://${host}`;
  const localPaymentMethodUrl = PAYMENT_APP_ROOT ? `${origin}/pay` : null;
  const parsedUrl = new URL(req.url, origin);
  let pathname = parsedUrl.pathname;

  // Set global CORS headers to allow cross-origin test demos and iframes
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  // Handle CORS preflight requests (e.g. cross-origin fetch from test iframes)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Handle /pay payment method endpoint (only when local payment app is mounted)
  if (PAYMENT_APP_ROOT && (pathname === '/pay' || pathname === '/pay/')) {
    // Payment method manifest discovery link header (W3C Payment Handler specification)
    const linkHeader = `<${origin}/pay/payment-manifest.json>; rel="payment-method-manifest"`;

    if (pathname === '/pay') {
      res.writeHead(301, {
        'Location': '/pay/',
        'Link': linkHeader,
      });
      res.end();
      return;
    }

    if (req.method === 'HEAD') {
      res.writeHead(200, {
        'Link': linkHeader,
      });
      res.end();
      return;
    }
  }

  // W3C Payment Method Manifest (serves default web app manifest location and supported origins)
  if (PAYMENT_APP_ROOT && pathname === '/pay/payment-manifest.json') {
    res.writeHead(200, {
      'Content-Type': 'application/x-payment-manifest',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(JSON.stringify({
      default_applications: [`${origin}/pay/manifest.json`],
      supported_origins: [origin, `http://localhost:${port}`, `http://127.0.0.1:${port}`, `http://${host}`]
    }, null, 2));
    return;
  }

  // Web App Manifest for the payment handler
  if (PAYMENT_APP_ROOT && pathname === '/pay/manifest.json') {
    res.writeHead(200, {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(JSON.stringify({
      name: 'Pay with BobBucks',
      short_name: 'BobBucks',
      icons: [{ src: '/pay/bobbucks.png', sizes: '256x256', type: 'image/png' }],
      serviceworker: { src: '/pay/sw-bobbucks.js', use_cache: false }
    }, null, 2));
    return;
  }

  // Service Worker for the payment handler
  if (PAYMENT_APP_ROOT && pathname === '/pay/sw-bobbucks.js') {
    const swPath = path.join(PAYMENT_APP_ROOT, 'pay', 'sw-bobbucks.js');
    if (fs.existsSync(swPath)) {
      const swCode = transformContent(fs.readFileSync(swPath, 'utf8'), localPaymentMethodUrl, origin);
      res.writeHead(200, {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Service-Worker-Allowed': '/',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
      res.end(swCode);
      return;
    }
  }

  // Static file resolution
  // If payment app is mounted and request is under /pay/, search PAYMENT_APP_ROOT first
  let searchRoots = [];
  if (PAYMENT_APP_ROOT && pathname.startsWith('/pay/')) {
    searchRoots = [PAYMENT_APP_ROOT, SITE_ROOT];
  } else {
    searchRoots = [SITE_ROOT];
  }

  let relPath = pathname.endsWith('/') ? pathname + 'index.html' : pathname;

  for (const root of searchRoots) {
    const candidate = path.join(root, relPath);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      let content = fs.readFileSync(candidate);
      const ext = path.extname(candidate).toLowerCase();
      const mime = MIME_TYPES[ext] || 'application/octet-stream';

      if (ext === '.html' || ext === '.js') {
        content = Buffer.from(transformContent(content.toString('utf8'), localPaymentMethodUrl, origin), 'utf8');
      }

      const headers = {
        'Content-Type': mime,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      };

      // Add Payment Method Link header if serving payment handler root HTML
      if (PAYMENT_APP_ROOT && (pathname === '/pay/' || pathname === '/pay/index.html')) {
        headers['Link'] = `<${origin}/pay/payment-manifest.json>; rel="payment-method-manifest"`;
      }

      res.writeHead(200, headers);
      res.end(content);
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found: ' + pathname);
});

server.listen(port, () => {
  const hostname = os.hostname();
  console.log('===============================================================');
  console.log(`🚀 rsolomakhin.github.io Test Server running on port ${port}`);
  console.log('===============================================================');
  console.log(`📌 Demo Suite URL:       http://localhost:${port}/`);
  console.log(`📁 Site Demo Root:       ${SITE_ROOT}`);
  if (PAYMENT_APP_ROOT) {
    console.log(`📁 Payment App Mounted:  ${PAYMENT_APP_ROOT} (at /pay/)`);
    console.log(`📌 BobBucks Method:      http://localhost:${port}/pay`);
  } else {
    console.log(`🌐 Payment App:          Live https://bobbucks.dev (pass --app-dir to mount local)`);
  }
  console.log('');
  console.log('🔗 If testing remotely (Mac / Linux / Windows PowerShell):');
  console.log(`   ssh -L ${port}:localhost:${port} ${hostname}`);
  console.log('===============================================================');
});

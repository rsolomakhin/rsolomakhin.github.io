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
const SITE_ROOT = path.resolve(__dirname, '../..');

// CLI Argument & Environment Variable Parsing
let appDir = process.env.PAYMENT_APP_DIR ? path.resolve(process.env.PAYMENT_APP_DIR) : null;
let port = parseInt(process.env.PORT || '8088', 10);

for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg === '--help' || arg === '-h') {
    console.log(`
rsolomakhin.github.io Local Test Server

Usage: node _tools/local_test_server/serve.js [options]

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
  node _tools/local_test_server/serve.js
  node _tools/local_test_server/serve.js --port 9000
  node _tools/local_test_server/serve.js --app-dir ../web-based-payment-app-example/public
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
  }
}

// Validate port number
if (isNaN(port) || port < 1 || port > 65535) {
  console.error(`❌ Error: Invalid port "${port}". Port must be an integer between 1 and 65535.`);
  process.exit(1);
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
 * Rewrites production URLs in HTML/JS files to the local server origin.
 *
 * - Maps https://rsolomakhin.github.io -> localhost origin.
 * - If a local payment app is mounted, maps https://bobbucks.dev -> localhost origin.
 *
 * @param {string} contentStr - File content.
 * @param {string|null} localPaymentMethodUrl - Local /pay URL (null if not mounted).
 * @param {string} origin - Local server origin (e.g. http://localhost:8088).
 * @return {string} Transformed content.
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
  // Validate Host header to prevent header/manifest injection, falling back to localhost:port
  const rawHost = req.headers.host || '';
  const host = /^[a-zA-Z0-9.\-]+(?::\d+)?$/.test(rawHost) ? rawHost : `localhost:${port}`;
  const origin = `http://${host}`;
  const localPaymentMethodUrl = PAYMENT_APP_ROOT ? `${origin}/pay` : null;
  const parsedUrl = new URL(req.url, origin);
  let pathname = parsedUrl.pathname;

  // Allow cross-origin manifest and resource loading
  res.setHeader('Access-Control-Allow-Origin', '*');

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
  let decodedPath = '';
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('400 Bad Request');
    return;
  }

  // Strip leading slash to treat as relative path within root
  let safeRelPath = decodedPath.startsWith('/') ? decodedPath.slice(1) : decodedPath;
  if (safeRelPath.endsWith('/') || safeRelPath === '') {
    safeRelPath += 'index.html';
  }

  // If payment app is mounted and request is under pay/, search PAYMENT_APP_ROOT first
  let searchRoots = [];
  if (PAYMENT_APP_ROOT && safeRelPath.startsWith('pay/')) {
    searchRoots = [PAYMENT_APP_ROOT, SITE_ROOT];
  } else {
    searchRoots = [SITE_ROOT];
  }

  for (const root of searchRoots) {
    // Resolve absolute path and guard against directory traversal attacks
    const candidate = path.resolve(root, safeRelPath);
    if (!candidate.startsWith(root + path.sep) && candidate !== root) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }

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

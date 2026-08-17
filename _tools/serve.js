#!/usr/bin/env node

/**
 * Self-contained local test server for all rsolomakhin.github.io & Payment Handler demos.
 * Serves full test suite at http://localhost:<PORT>/ with live reloading.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const MERCHANT_ROOT = path.resolve(__dirname, '..');

// CLI Argument Parsing
let appDir = process.env.PAYMENT_APP_DIR || null;
let port = parseInt(process.env.PORT || '8088', 10);

for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg === '--help' || arg === '-h') {
    console.log(`
Web Payments & Payment Handler Local Test Server

Usage: node _tools/serve.js [options]

Options:
  -p, --port <number>      Port to listen on (default: 8088, or PORT env var)
  -a, --app-dir <path>     Custom payment handler directory to mount at /pay/
                           (default: auto-detects web-based-payment-app-example/public)
  -h, --help               Show this help message

Examples:
  node _tools/serve.js
  node _tools/serve.js --port 9000
  node _tools/serve.js --app-dir ../my-custom-payment-app/public
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
    port = parseInt(arg, 10);
  }
}

// Auto-detect BobBucks payment handler directory if not explicitly provided
let BOBBUCKS_ROOT = null;
if (appDir) {
  if (fs.existsSync(appDir) && fs.statSync(appDir).isDirectory()) {
    BOBBUCKS_ROOT = appDir;
  } else {
    console.warn(`⚠️ Warning: Specified --app-dir "${appDir}" does not exist or is not a directory.`);
  }
}

if (!BOBBUCKS_ROOT) {
  const candidates = [
    path.join(MERCHANT_ROOT, 'web-based-payment-app-example', 'public'),
    path.join(MERCHANT_ROOT, '..', 'web-based-payment-app-example', 'public'),
    path.join(MERCHANT_ROOT, 'public'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      BOBBUCKS_ROOT = candidate;
      break;
    }
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

function transformContent(contentStr, paymentMethodUrl, origin) {
  let str = contentStr.replace(/https:\/\/bobbucks\.dev\/pay/g, paymentMethodUrl);
  str = str.replace(/https:\/\/bobbucks\.dev/g, origin);
  str = str.replace(/https:\/\/rsolomakhin\.github\.io/g, origin);
  str = str.replace(/http:\/\/rsolomakhin\.github\.io/g, origin);
  str = str.replace(/request\.addEventListener\(/g, 'if (request) request.addEventListener(');
  return str;
}

const server = http.createServer((req, res) => {
  const host = req.headers.host || `localhost:${port}`;
  const origin = `http://${host}`;
  const paymentMethodUrl = `${origin}/pay`;
  const parsedUrl = new URL(req.url, origin);
  let pathname = parsedUrl.pathname;

  if (pathname === '/pay') {
    res.writeHead(301, {
      'Location': '/pay/',
      'Link': `<${origin}/pay/payment-manifest.json>; rel="payment-method-manifest"`,
    });
    res.end();
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Link', `<${origin}/pay/payment-manifest.json>; rel="payment-method-manifest"`);
  res.setHeader('Service-Worker-Allowed', '/');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Payment Method Manifest
  if (pathname === '/pay/payment-manifest.json' || pathname === '/payment-manifest.json') {
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

  // Web App Manifest
  if (pathname === '/pay/manifest.json' || pathname === '/manifest.json') {
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

  // Service Worker
  if (BOBBUCKS_ROOT && (pathname === '/pay/sw-bobbucks.js' || pathname === '/sw.js')) {
    const swPath = path.join(BOBBUCKS_ROOT, 'pay', 'sw-bobbucks.js');
    if (fs.existsSync(swPath)) {
      const swCode = transformContent(fs.readFileSync(swPath, 'utf8'), paymentMethodUrl, origin);
      res.writeHead(200, {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Service-Worker-Allowed': '/',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
      res.end(swCode);
      return;
    }
  }

  if (pathname === '/payment-app.js') pathname = '/pay/payment-app.js';
  if (pathname === '/handler.html' || pathname === '/payment_handler_window.html') pathname = '/pay/index.html';

  // Serve static files with priority routing
  let primaryRoot = (BOBBUCKS_ROOT && pathname.startsWith('/pay')) ? BOBBUCKS_ROOT : MERCHANT_ROOT;
  let secondaryRoot = (BOBBUCKS_ROOT && pathname.startsWith('/pay')) ? MERCHANT_ROOT : BOBBUCKS_ROOT;

  let relPath = pathname.endsWith('/') ? pathname + 'index.html' : pathname;
  let candidate = path.join(primaryRoot, relPath);
  if ((!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) && secondaryRoot) {
    candidate = path.join(secondaryRoot, relPath);
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    let content = fs.readFileSync(candidate);
    const ext = path.extname(candidate).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    if (ext === '.html' || ext === '.js') {
      content = Buffer.from(transformContent(content.toString('utf8'), paymentMethodUrl, origin), 'utf8');
    }
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache, no-store, must-revalidate' });
    res.end(content);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found: ' + pathname);
});

server.listen(port, () => {
  const hostname = os.hostname();
  console.log('===============================================================');
  console.log(`🚀 Web Payments Local Test Server running on port ${port}`);
  console.log('===============================================================');
  console.log(`📌 Demo Suite URL:       http://localhost:${port}/`);
  console.log(`📌 BobBucks Merchant:    http://localhost:${port}/pr/bob/`);
  console.log(`📁 Merchant Root:        ${MERCHANT_ROOT}`);
  if (BOBBUCKS_ROOT) {
    console.log(`📁 Payment App Root:     ${BOBBUCKS_ROOT}`);
  } else {
    console.log(`ℹ️ Payment App Root:     (Not mounted — pass --app-dir <path> to test BobBucks)`);
  }
  console.log('🔗 If testing remotely (Mac / Linux / Windows PowerShell):');
  console.log(`   ssh -L ${port}:localhost:${port} ${hostname}`);
  console.log('===============================================================');
});

# Web Payments & Payment Handler Local Test Server

A zero-dependency local HTTP test server for running and testing the `rsolomakhin.github.io` demo suite and Payment Handler apps locally.

## Features

- **Dynamic Manifests**: Automatically generates and serves W3C Payment Method Manifest (`rel="payment-method-manifest"`), Web App Manifest, ServiceWorker routing, and CORS headers.
- **Dynamic Origin Rewriting**: Dynamically maps `https://rsolomakhin.github.io` and `https://bobbucks.dev` to `http://localhost:<PORT>` on the fly.
- **Live Reloading**: Serves files with `no-cache` headers so local code edits in payment handlers or merchant demos reflect immediately.
- **Custom Payment Apps**: Auto-detects `web-based-payment-app-example/public` or accepts any custom payment handler directory via `--app-dir`.
- **Zero Dependencies**: Uses standard Node.js built-ins (`http`, `fs`, `path`, `os`).

## Usage

### 1. Basic Start
From the root of `rsolomakhin.github.io`:
```bash
node _tools/serve.js
```
The server will start on port `8088` and serve the full demo index at `http://localhost:8088/`.

### 2. Options & Flags

```text
Usage: node _tools/serve.js [options]

Options:
  -p, --port <number>      Port to listen on (default: 8088, or PORT env var)
  -a, --app-dir <path>     Custom payment handler directory to mount at /pay/
                           (default: auto-detects web-based-payment-app-example/public)
  -h, --help               Show help message
```

#### Examples:
```bash
# Run on custom port
node _tools/serve.js --port 9000

# Mount a custom payment handler directory
node _tools/serve.js --app-dir /path/to/my-payment-app/public
```

## Testing with Chromium

Because `http://localhost` is treated as a Secure Context by Chromium, Payment Request and Payment Handler APIs work out of the box.

```bash
# If testing remotely (e.g. from Cloudtop to Mac):
ssh -L 8088:localhost:8088 <remote-host>

# Launch Chromium on local machine:
out/Default/Chromium.app/Contents/MacOS/Chromium \
  --user-data-dir=/tmp/payment_test_profile \
  --enable-features=PaymentHandlerCameraAccess \
  http://localhost:8088/
```

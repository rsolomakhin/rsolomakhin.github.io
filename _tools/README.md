# Web Payments Local Test Server

A zero-dependency local HTTP test server for running and testing the `rsolomakhin.github.io` demo suite and optional Web Payment Handlers locally.

## What This Server Does

1. **Serves `rsolomakhin.github.io` Locally**: Serves the local repository copy of all merchant and feature demos (e.g. `/pr/*`, SPC demos, Autofill tests) at `http://localhost:<PORT>/`.
2. **Rewrites Production URLs**: Automatically maps hardcoded `https://rsolomakhin.github.io` links to `http://localhost:<PORT>` on the fly.
3. **Optional Local Payment Handler (`--app-dir`)**:
   - When `--app-dir <path>` (or `PAYMENT_APP_DIR`) is specified, it mounts the provided payment handler directory at `/pay/`, serves W3C Payment Method and Web App manifests, and routes `https://bobbucks.dev/pay` to `http://localhost:<PORT>/pay`.
   - When `--app-dir` is **omitted**, the server does **not** mount a local payment handler; merchant demos will fall back to using the live `https://bobbucks.dev` payment handler on the web.
4. **Live Reloading**: Serves files with `no-cache` headers so local code edits reflect immediately.
5. **Zero Dependencies**: Uses standard Node.js built-ins (`http`, `fs`, `path`, `os`).

## Usage

### 1. Basic Start
From the root of `rsolomakhin.github.io`:
```bash
node _tools/serve.js
```
The server will start on port `8088` and serve the full demo index at `http://localhost:8088/`.

### 2. Mounting a Local Payment Handler
To test local changes to a payment handler (e.g. `web-based-payment-app-example`):
```bash
node _tools/serve.js --app-dir ../web-based-payment-app-example/public
```

### 3. Custom Ports
```bash
# Via positional argument
node _tools/serve.js 9000

# Via --port flag
node _tools/serve.js --port 9000
```

### 4. Options & Flags

```text
Usage: node _tools/serve.js [port] [options]

Arguments:
  [port]                   Optional port number (e.g. node _tools/serve.js 9000)

Options:
  -p, --port <number>      Port to listen on (default: 8088, or PORT env var)
  -a, --app-dir <path>     Directory of a local payment handler app to mount at /pay/
                           (e.g. /path/to/web-based-payment-app-example/public).
                           If omitted, merchant demos fall back to live https://bobbucks.dev
  -h, --help               Show this help message
```

### 5. Environment Variables

- **`PORT`**: Override the listening port (default: `8088`). Useful in CI pipelines or if port 8088 is occupied by another process.
- **`PAYMENT_APP_DIR`**: Path to a local payment handler directory. Useful in persistent test configurations or shell profiles to avoid passing `--app-dir` on every invocation.

```bash
PORT=9090 PAYMENT_APP_DIR=../web-based-payment-app-example/public node _tools/serve.js
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

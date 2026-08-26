# Web Payments Local Test Server

A local HTTP test server for running and testing the `rsolomakhin.github.io` demo suite and optional Web Payment Handlers locally.

## What This Server Does

1. **Serves `rsolomakhin.github.io` Locally**: Serves the local repository copy of all merchant and feature demos (e.g. `/pr/*`, SPC demos, Autofill tests) at `http://localhost:<PORT>/`.
2. **Rewrites Production URLs**: Automatically maps hardcoded `https://rsolomakhin.github.io` links to `http://localhost:<PORT>` on the fly.
3. **Optional Local Payment Handler (`--app-dir`)**:
   - When `--app-dir <path>` (or `PAYMENT_APP_DIR`) is specified, it mounts the provided payment handler directory at `/pay/`.
   - When `--app-dir` is **omitted**, merchant demos fall back to using the live `https://bobbucks.dev` payment handler on the web.
4. **Live Reloading**: Serves files with `no-cache` headers so local code edits reflect immediately.

## Usage

### 1. Basic Start
From the root of your local `rsolomakhin.github.io` repository:
```bash
node _tools/local_test_server/serve.js
```
The server starts a local copy of `rsolomakhin.github.io` on the specified port (default: `8088`), using the specified payment handler (or live `https://bobbucks.dev` if none provided).

### 2. Mounting a Local Payment Handler
To test local changes to a payment handler (e.g. `web-based-payment-app-example`):
```bash
node _tools/local_test_server/serve.js --app-dir ../web-based-payment-app-example/public
```

### 3. Custom Ports
```bash
node _tools/local_test_server/serve.js --port 9000
```

### 4. Options & Flags

```text
Usage: node _tools/local_test_server/serve.js [options]

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
PORT=9090 PAYMENT_APP_DIR=../web-based-payment-app-example/public node _tools/local_test_server/serve.js
```

## Remote Testing

If testing remotely:
```bash
ssh -L 8088:localhost:8088 <remote-host>
```

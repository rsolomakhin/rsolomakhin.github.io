## Two service workers example

If your [payment handler](https://w3c.github.io/payment-handler/) needs to
compartmentalize the payment instruments into two wallets, one of the simplest
approaches is to use two separate service workers with different [scopes]() or
paths. Here's the list of files to enable this solution for the
personal/business split of the payment instruments in the fictional product
named Bob Pay. A visitor to `/personal` and `/business` paths on your website
will be able to install two service workers with different responsibilities.

### `/personal/manifest.json`

```json
{
  "name": "Bob Pay Personal",
  "icons": [{
    "src": "/img/personal.png"
  }]
}
```

### `/personal/index.html`

```html
<!-- At the time of writing, the web app manifest specified like so will be used
for the payment handler name and icon: -->
<link rel="manifest" href="/personal/manifest.json">

<script>
function install() {
  if (!navigator.serviceWorker) {
    console.log('Service workers not supported.');
    return;
  }

  navigator.serviceWorker.register('/personal/payment-handler.js', '/personal')
  .then(function(registration) {
    console.log('Registered the service worker for ' + registration.scope);
  }).catch(function(error) {
    console.log(error);
  });
}
</script>
<button onclick="install()">Install Bob Pay Personal</button>
```

### `/personal/payment-handler.js`

```javascript
self.addEventListener('paymentrequest', function(e) {
  console.log('Not implemented.');
  e.respondWith(undefined);
});
```

### `/business/manifest.json`

```json
{
  "name": "Bob Pay Business",
  "icons": [{
    "src": "/img/business.png"
  }]
}
```

### `/business/index.html`

```html
<!-- At the time of writing, the web app manifest specified like so will be used
for the payment handler name and icon: -->
<link rel="manifest" href="/business/manifest.json">

<script>
function install() {
  if (!navigator.serviceWorker) {
    console.log('Service workers not supported.');
    return;
  }

  navigator.serviceWorker.register('/business/payment-handler.js', '/business')
  .then(function(registration) {
    console.log('Registered the service worker for ' + registration.scope);
  }).catch(function(error) {
    console.log(error);
  });
}
</script>
<button onclick="install()">Install Bob Pay Business</button>
```

### `/business/payment-handler.js`

```javascript
self.addEventListener('paymentrequest', function(e) {
  console.log('Not implemented.');
  e.respondWith(undefined);
});
```


# Two service workers example

If your [payment handler](https://w3c.github.io/payment-handler/) needs to
compartmentalize the payment instruments into two wallets, one of the simplest
approaches is to use two separate service workers with different
[scopes](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers#Registering_your_worker)
or paths. Here's the list of files to enable this solution for the
personal/business split of the payment instruments in the fictional product
named Bob Pay. A visitor to `/personal` and `/business` paths on your website
will be able to install two service workers with different responsibilities.

## Files in `/personal/` subdirectory:

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

<h1>Bob Pay Personal Wallet</h1>

<button id="register-button" style="display: none;" onclick="install()">Install
Bob Pay Personal Wallet</button>

<script>
var SW_URL = '/personal/payment-handler.js';
var SW_SCOPE = '/personal/';
if (navigator.serviceWorker) {
  navigator.serviceWorker.getRegistration(SW_URL)
  .then(function(registration) {
    if (!registration) {
      document.getElementById('register-button').style.display = 'block';
    }
  });
}

function install() {
  if (!navigator.serviceWorker) {
    console.log('Service workers not supported.');
    return;
  }

  navigator.serviceWorker.register(SW_URL, SW_SCOPE)
  .then(function(registration) {
    console.log('Registered the service worker for ' + registration.scope);
  }).catch(function(error) {
    console.log(error);
  });
}
</script>

<p>You can switch to manage <a href="/business/">Bob Pay Business Wallet</a>.</p>
```

### `/personal/payment-handler.js`

```javascript
self.addEventListener('paymentrequest', function(e) {
  console.log('Not implemented.');
  e.respondWith(undefined);
});
```

## Files in `/business/` subdirectory:

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

<h1>Bob Pay Business Wallet</h1>

<button id="register-button" style="display: none;" onclick="install()">Install
Bob Pay Business Wallet</button>

<script>
var SW_URL = '/business/payment-handler.js';
var SW_SCOPE = '/business/';
if (navigator.serviceWorker) {
  navigator.serviceWorker.getRegistration(SW_URL)
  .then(function(registration) {
    if (!registration) {
      document.getElementById('register-button').style.display = 'block';
    }
  });
}

function install() {
  if (!navigator.serviceWorker) {
    console.log('Service workers not supported.');
    return;
  }

  navigator.serviceWorker.register(SW_URL, SW_SCOPE)
  .then(function(registration) {
    console.log('Registered the service worker for ' + registration.scope);
  }).catch(function(error) {
    console.log(error);
  });
}
</script>

<p>You can switch to manage <a href="/personal/">Bob Pay Personal Wallet</a>.</p>
```

### `/business/payment-handler.js`

```javascript
self.addEventListener('paymentrequest', function(e) {
  console.log('Not implemented.');
  e.respondWith(undefined);
});
```


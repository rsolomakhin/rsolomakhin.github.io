self.importScripts('data.js');

// TODO: Keep state in the window instead, because a single service worker
// can talk to multiple windows.

self.changePaymentMethod = null;
self.resolver = null;
self.client = null;
self.response = response1;

self.addEventListener('message', (evt) => {
  if (evt.data === 'confirm' && self.resolver !== null) {
    self.resolver(response);
    self.resolver = null;
  } else if (evt.data === 'change-method-1' && self.changePaymentMethod !== null) {
    response = response1;
    self.changePaymentMethod(response.methodName, redact(response)).then((paymentMethodChangeResponse) => {
      self.client.postMessage(paymentMethodChangeResponse);
    }).catch((error) => {
      self.client.postMessage({error: error.message});
    });
  } else if (evt.data === 'change-method-2' && self.changePaymentMethod !== null) {
    response = response2;
    self.changePaymentMethod(response.methodName, redact(response)).then((paymentMethodChangeResponse) => {
      self.client.postMessage(paymentMethodChangeResponse);
    }).catch((error) => {
      self.client.postMessage({error: error.message});
    });
  } else {
    console.log('Unrecognized message: ' + evt.data);
  }
});

self.addEventListener('paymentrequest', (evt) => {
  if (evt.delegateToWindow) {
    evt.delegateToWindow('confirm.html');
    return;
  }

  self.changePaymentMethod = evt.changePaymentMethod;
  evt.respondWith(new Promise((resolve) => {
    self.resolver = resolve;
    self.client = evt.openWindow('confirm.html');
  }));
});

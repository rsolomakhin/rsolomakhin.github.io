self.importScripts('data.js');

// TODO: Keep state in the window instead, because a single service worker
// can talk to multiple windows.

self.paymentRequestEvent = null;
self.resolver = null;
self.client = null;
self.response = response1;

self.addEventListener('message', (evt) => {
  if (evt.data === 'confirm' && self.resolver !== null) {
    self.resolver(response);
    self.resolver = null;
  } else if (evt.data === 'change-method-1' && self.paymentRequestEvent !== null && self.paymentRequestEvent.changePaymentMethod) {
    response = response1;
    self.paymentRequestEvent.changePaymentMethod(response.methodName, redact(response)).then((paymentMethodChangeResponse) => {
      self.client.postMessage(paymentMethodChangeResponse);
    }).catch((error) => {
      self.client.postMessage({error: error.message});
    });
  } else if (evt.data === 'change-method-2' && self.paymentRequestEvent !== null && self.paymentRequestEvent.changePaymentMethod) {
    response = response2;
    self.paymentRequestEvent.changePaymentMethod(response.methodName, redact(response)).then((paymentMethodChangeResponse) => {
      self.client.postMessage(paymentMethodChangeResponse);
    }).catch((error) => {
      self.client.postMessage({error: error.message});
    });
  } else {
    self.client.postMessage({error: 'Service worker did not recognize the message "' + evt.data + '".'});
  }
});

self.addEventListener('paymentrequest', (evt) => {
  if (evt.delegateToWindow) {
    evt.delegateToWindow('confirm.html');
    return;
  }

  self.paymentRequestEvent = evt;
  self.paymentRequestEvent.respondWith(new Promise((resolve) => {
    self.resolver = resolve;
    self.client = evt.openWindow('confirm.html');
  }));
});

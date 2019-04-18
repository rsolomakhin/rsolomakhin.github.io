self.importScripts('data.js');

// TODO: Keep state in the window instead, because a single service worker
// can talk to multiple windows.

self.paymentRequestEvent = null;
self.resolver = null;
self.response = response1;

self.addEventListener('message', (evt) => {
  if (evt.data === 'confirm') {
    if (self.resolver !== null) {
      self.resolver(response);
      self.resolver = null;
    } else {
      evt.source.postMessage({error: 'Service worker cannot confirm payment because there is no resolver function.'});
    }
  } else if (evt.data === 'change-method-1') {
    response = response1;
    if (self.paymentRequestEvent !== null && self.paymentRequestEvent.changePaymentMethod) {
      self.paymentRequestEvent.changePaymentMethod(response.methodName, redact(response)).then((paymentMethodChangeResponse) => {
        self.client.postMessage(paymentMethodChangeResponse);
      }).catch((error) => {
        self.client.postMessage({error: error.message});
      });
    } else {
      evt.source.postMessage({error: 'Service worker cannot change payment method because there is payment request event or no change payment method feature'});
    }
  } else if (evt.data === 'change-method-2') {
    response = response2;
    if (self.paymentRequestEvent !== null && self.paymentRequestEvent.changePaymentMethod) {
      self.paymentRequestEvent.changePaymentMethod(response.methodName, redact(response)).then((paymentMethodChangeResponse) => {
        self.client.postMessage(paymentMethodChangeResponse);
      }).catch((error) => {
        self.client.postMessage({error: error.message});
      });
    } else {
      evt.source.postMessage({error: 'Service worker cannot change payment method because there is payment request event or no change payment method feature'});
    }
  } else {
    evt.source.postMessage({error: 'Service worker did not recognize the message "' + evt.data + '".'});
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
    evt.openWindow('confirm.html');
  }));
});

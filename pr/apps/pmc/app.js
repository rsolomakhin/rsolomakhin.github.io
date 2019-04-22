self.importScripts('data.js');

// TODO: Keep state in the window instead, because a single service worker
// can talk to multiple windows.

self.paymentRequestEvent = null;
self.resolver = null;
self.response = response1;

function notifyPaymentMethodChanged(messageDestination) {
  self.paymentRequestEvent.changePaymentMethod(self.response.methodName, redact(self.response)).then((paymentMethodChangeResponse) => {
    console.log(JSON.stringify(paymentMethodChangeResponse, undefined, 2));
    messageDestination.postMessage(paymentMethodChangeResponse);
  }).catch((error) => {
    console.log(error.message);
    messageDestination.postMessage({error: error.message});
  });
}

self.addEventListener('message', (evt) => {
  if (evt.data === 'confirm') {
    if (self.resolver !== null) {
      self.resolver(response);
      self.resolver = null;
    } else {
      evt.source.postMessage({error: 'Service worker cannot confirm payment because there is no resolver function.'});
    }
  } else if (evt.data === 'change-method-1') {
    self.response = response1;
    if (self.paymentRequestEvent !== null && self.paymentRequestEvent.changePaymentMethod) {
      notifyPaymentMethodChanged(evt.source);
    } else {
      evt.source.postMessage({error: 'Service worker cannot change payment method. There is no payment request event or no change payment method feature.'});
    }
  } else if (evt.data === 'change-method-2') {
    self.response = response2;
    if (self.paymentRequestEvent !== null && self.paymentRequestEvent.changePaymentMethod) {
      notifyPaymentMethodChanged(evt.source);
    } else {
      evt.source.postMessage({error: 'Service worker cannot change payment method. There is no payment request event or no change payment method feature.'});
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

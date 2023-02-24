// For testing purposes only, we keep state on the global object. This is not
// correct in practice, as a single service worker could be talking to multiple
// windows.
self.resolver = null;
self.response = {
  // The methodName is purely informative to the caller.
  methodName: 'https://rsolomakhin.github.io/pr/apps/delegation/delegate_all',
  details: {},
};
self.currentPaymentHandlerWindow = null;

self.addEventListener('paymentrequest', (evt) => {
  evt.respondWith(new Promise((resolve) => {
    self.resolver = resolve;
    evt.openWindow('payment_handler_window.html')
        .then((windowClient) => {
          self.currentPaymentHandlerWindow = windowClient;
          self.currentPaymentHandlerWindow.postMessage({
            'total' : evt.total,
          });
        })
        .catch((error) => {
          console.log(error.message);
        });
  }));
});

self.addEventListener('message', (evt) => {
  if (evt.data && evt.data.type === 'confirm') {
    if (self.resolver !== null) {
      self.resolver(response);
      self.resolver = null;
    } else {
      sendMessage({
        error:
            'Service worker cannot confirm payment because there is no resolver function.'
      });
    }
  } else {
    sendMessage({
      error: 'Service worker did not recognize the message "' + evt.data + '".'
    });
  }
});

function sendMessage(msg) {
  if (self.currentPaymentHandlerWindow) {
    console.log(
        'Sending message to payment handler window: ' +
        JSON.stringify(msg, undefined, 2));
    self.currentPaymentHandlerWindow.postMessage(msg);
  } else {
    console.log(
        'No destination found for message: ' +
        JSON.stringify(msg, undefined, 2));
  }
}


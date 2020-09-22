self.addEventListener('paymentrequest', e => {
  payment_request_event = e;

  e.respondWith({});
  e.openWindow(checkoutURL).then(client => {
    if (client === null) {
      resolver.reject('Failed to open window');
    }
  }).catch(err => {
    resolver.reject(err);
  });
});


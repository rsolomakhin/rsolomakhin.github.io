self.addEventListener('paymentrequest', e => {
  e.respondWith({});
  e.openWindow(checkoutURL).then(client => {}).catch(err => {});
});

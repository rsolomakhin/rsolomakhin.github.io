self.addEventListener('canmakepayment', (evt) => {
  evt.respondWith(true);
});

self.addEventListener('paymentrequest', (evt) => {
    evt.respondWith(new Promise((resolve) => {
      self.resolver = resolve;
      evt.openWindow('confirm.html');
    }));
});

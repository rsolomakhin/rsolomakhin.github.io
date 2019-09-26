self.addEventListener('paymentrequest', (evt) => {
  evt.respondWith(new Promise((resolve) => {
    evt.openWindow('confirm.html');
  }));
});

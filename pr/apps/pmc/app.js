self.addEventListener('paymentrequest', (evt) => {
    evt.respondWith(new Promise(() => {
      evt.openWindow('confirm.html');
    }));
});

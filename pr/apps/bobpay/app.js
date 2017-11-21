self.addEventListener('canmnakepayment', (evt) => {
  evt.respondWith(true);
});

self.addEventListener('paymentrequest', (evt) => {
    evt.respondWith({
        methodName: 'https://emerald-eon.appspot.com/bobpay',
        details: {
            token: '1234567890',
        },
    });
});

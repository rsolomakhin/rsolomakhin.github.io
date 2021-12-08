self.addEventListener('canmakepayment', (evt) => {
  evt.respondWith(true);
});

self.addEventListener('paymentrequest', (evt) => {
    evt.respondWith({
        methodName: 'https://bobbucks.dev/pay',
        details: {
            token: '1234567890',
        },
    });
});

self.addEventListener('canmakepayment', (evt) => {
  evt.respondWith(true);
});

self.addEventListener('paymentrequest', (evt) => {
    evt.respondWith({
        methodName: 'https://rsolomakhin.github.io',
        details: {
            token: '1234567890',
        },
    });
});

self.addEventListener('canmnakepayment', (evt) => {
  evt.respondWith(false);
});

self.addEventListener('paymentrequest', (evt) => {
    evt.respondWith({
        methodName: 'https://rsolomakhin.github.io',
        details: {
            token: '0987654321',
        },
    });
});

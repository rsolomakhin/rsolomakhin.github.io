self.addEventListener('canmnakepayment', (evt) => {
  evt.respondWith(true);
});

self.addEventListener('paymentrequest', (evt) => {
    evt.respondWith({
        methodName: 'https://bobpay.xyz/pay',
        details: {
            token: '1234567890',
        },
    });
});

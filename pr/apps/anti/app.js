self.addEventListener('install', (evt) => {
    console.log('Installed');
});

self.addEventListener('canmnakepayment', (evt) => {
    evt.respondWith(new Promise((resolve) => {
        console.log('Cannot make payments');
        resolve(false);
    });
});

self.addEventListener('paymentrequest', (evt) => {
    console.log('Payment requested');
    evt.respondWith({
        methodName: 'https://rsolomakhin.github.io',
        details: {
            token: '0987654321',
        },
    });
});

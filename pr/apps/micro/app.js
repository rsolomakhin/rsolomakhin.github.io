self.addEventListener('canmnakepayment', (evt) => {
  if (evt.respondWith2 && evt.currency) { 
    return evt.respondWith2({
      canMakePayment: true,
      readyForMicrotransaction: evt.currency === 'USD',
      accountBalance: '18.00',
    });
  } else {
    evt.respondWith(true);
  }
});

self.addEventListener('paymentrequest', (evt) => {
  evt.respondWith({
    methodName: 'https://rsolomakhin.github.io',
    details: {
      token: '1234567890',
    },
  });
});

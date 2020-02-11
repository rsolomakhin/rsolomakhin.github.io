self.addEventListener('canmakepayment', (evt) => {
  if (evt.respondWithMinimalUI && evt.currency) { 
    return evt.respondWithMinimalUI({
      canMakePayment: true,
      readyForMinimalUI: evt.currency === 'USD',
      accountBalance: '5.00',
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

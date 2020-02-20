self.addEventListener('canmakepayment', (evt) => {
  if (evt.respondWithMinimalUI && evt.currency) { 
    return evt.respondWithMinimalUI({
      canMakePayment: true,
      readyForMinimalUI: evt.currency === 'USD',
      accountBalance: '5.00',
    });
  } else {
    console.log('Minimal UI feature is not enabled. Is ' +
        'chrome://flags/#enable-web-payments-minimal-ui flag enabled?');
    evt.respondWith(false);
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

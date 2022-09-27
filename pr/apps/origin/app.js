self.addEventListener('canmakepayment', (evt) => {
  if (evt.paymentRequestOrigin) {
    console.log(evt.paymentRequestOrigin);
  } else {
    console.log("No paymentRequestOrigin field in canmakepayment event.");
  }

  if (evt.topOrigin) {
    console.log(evt.topOrigin);
  } else {
    console.log("No topOrigin field in canmakepayment event.");
  }

  if (evt.methodData) {
    console.log(evt.methodData);
  } else {
    console.log("No methodData field in canmakepayment event.");
  }

  if (evt.modifiers) {
    console.log(evt.modifiers);
  } else {
    console.log("No modifiers field in canmakepayment event.");
  }


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

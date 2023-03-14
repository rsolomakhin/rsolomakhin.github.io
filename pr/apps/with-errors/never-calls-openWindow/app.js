self.addEventListener('canmakepayment', (evt) => {
  evt.respondWith(true);
});

self.addEventListener('paymentrequest', (evt) => {
    // This app never calls openWindow, and simply resolves the promise after a
    // 10s timeout.
    evt.respondWith(new Promise((resolve) => {
      console.log('paymentrequest event detected, waiting 10s');
      setTimeout(() => {
        console.log('Resolving promise without calling openWindow');
	const response = {
	  // The methodName is purely informative to the caller.
          methodName: 'https://rsolomakhin.github.io/pr/apps/with-errors/never-calls-openWindow/',
          details: {},
        };
        resolve(response);
      }, 10 * 1000);
    }));
});

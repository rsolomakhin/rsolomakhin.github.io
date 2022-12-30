self.addEventListener('paymentrequest', (evt) => {
    evt.respondWith(new Promise((responder) => {
        responder({ methodName: evt.methodData[0].supportedMethods, details: { status: 'success' } });
    }));
});
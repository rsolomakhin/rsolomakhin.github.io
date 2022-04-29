self.resolver = null;

const response = {
  methodName: 'https://rsolomakhin.github.io/pr/apps/src2',
  details: {
      billingAddress: {
          addressLine: [
              '1875 Explorer St #1000',
          ],
          city: 'Reston',
          country: 'US',
          dependentLocality: '',
          languageCode: '',
          organization: 'Google',
          phone: '+15555555555',
          postalCode: '20190',
          recipient: 'Jon Doe',
          region: 'VA',
          sortingCode: ''
      },
      cardNumber: '4111111111111111',
      cardSecurityCode: '123',
      cardholderName: 'Jon Doe',
      expiryMonth: '01',
      expiryYear: '2020',
  },
};

self.addEventListener('message', (evt) => {
  if (evt.data === 'confirm' && self.resolver !== null) {
    self.resolver(response);
    self.resolver = null;
  } else {
    console.log('Unrecognized message: ' + evt.data);
  }
});

self.addEventListener('canmakepayment', (evt) => {
  if (evt.topOrigin !== 'https://rsolomakhin.github.io/') {
    console.log('Hi ' + evt.topOrigin + '!');
  }
  if (evt.paymentRequestOrigin !== 'https://rsolomakhin.github.io/' && evt.paymentRequestOrigin !== evt.topOrigin) {
    console.log('Hi ' + evt.paymentRequestOrigin + '!');
  }
  if (evt.modifiers && evt.modifiers.length > 0) {
    console.log('Modifiers are present.');
  }
  if (evt.methodData && evt.methodData.length !== 1) {
    console.log('Did not expect ' + str(evt.methodData.length) + ' methods.');
  }
  evt.respondWith(true);
});

self.addEventListener('paymentrequest', (evt) => {
    evt.respondWith(new Promise((resolve) => {
      self.resolver = resolve;
      evt.openWindow('confirm.html');
    }));
});

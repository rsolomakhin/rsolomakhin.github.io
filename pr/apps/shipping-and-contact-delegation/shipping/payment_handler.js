function findSelectedShippingOptionId(shippingOptions) {
  if (!shippingOptions)
    return '';
  for (option of shippingOptions) {
    if (option.selected)
      return option.id;
  }
  return '';
}

self.addEventListener('paymentrequest', (evt) => {
  evt.respondWith({
    methodName: 'basic-card',
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
    shippingAddress: evt.paymentOptions.requestShipping ? {
      city: 'Reston',
      country: 'US',
      dependentLocality: '',
      organization: 'Google',
      phone: '+15555555555',
      postalCode: '20190',
      recipient: 'Jon Doe',
      region: 'VA',
      sortingCode: '',
      addressLine: [
        '1875 Explorer St #1000',
      ],
    } :
                                                          {},
    shippingOption: evt.paymentOptions.requestShipping ?
        findSelectedShippingOptionId(evt.shippingOptions) :
        '',
  });
});

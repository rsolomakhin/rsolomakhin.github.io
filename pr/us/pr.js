function onBuyClicked() {
  var supportedInstruments = [
    'https://android.com/pay', 'visa', 'mastercard', 'amex', 'discover',
    'maestro', 'diners', 'jcb', 'unionpay'
  ];

  var details = {
    items: [
      {
        id: 'original',
        label: 'Original donation amount',
        amount: {currencyCode: 'USD', value: '65.00'}
      },
      {
        id: 'discount',
        label: 'Friends and family discount',
        amount: {currencyCode: 'USD', value: '-10.00'}
      },
      {
        id: 'total',
        label: 'Donation',
        amount: {currencyCode: 'USD', value: '55.00'}
      }
    ]
  };

  var options = {requestShipping: true};

  var schemeData = {
    'https://android.com/pay': {
      'gateway': 'stripe',
      'stripe:publishableKey': 'pk_test_VKUbaXb3LHE7GdxyOBMNwXqa',
      'stripe:version': '2015-10-16 (latest)'
    }
  };

  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    var request =
        new PaymentRequest(supportedInstruments, details, options, schemeData);

    request.addEventListener('ShippingAddressChange', e => {
      e.updateWith(new Promise((resolve, reject) => {
        if (request.shippingAddress.regionCode == 'US') {
          var shippingOption = {
            id: '',
            label: '',
            amount: {currencyCode: 'USD', value: '0.00'}
          };
          if (request.shippingAddress.administrativeArea == 'CA') {
            shippingOption.id = 'ca';
            shippingOption.label = 'Free shipping in California';
            details.items[details.items.length - 1].amount.value = '55.00';
          } else {
            shippingOption.id = 'us';
            shippingOption.label = 'Standard shipping in US';
            details.items[details.items.length - 1].amount.value = '60.00';
          }
          if (details.items.length == 3) {
            details.items.splice(-1, 0, shippingOption);
          } else {
            details.items.splice(-1, 1, shippingOption);
          }
          details.shippingOptions = [shippingOption];
        } else {
          delete details.shippingOptions;
        }
        resolve(details);
      }));
    });

    request.show()
        .then(instrumentResponse => {
          window.setTimeout(() => {
            instrumentResponse.complete(true)
                .then(() => {
                  done(
                      'Thank you!', request.shippingAddress,
                      request.shippingOption, instrumentResponse.methodName,
                      instrumentResponse.details);
                })
                .catch(err => { error(err.message); });
          }, 2000);
        })
        .catch(err => { error(err.message); });

  } catch (e) {
    error('Developer mistake: \'' + e.message + '\'');
  }
}

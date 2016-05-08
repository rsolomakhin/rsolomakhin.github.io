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

  var options = null;

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

/* global done:false */
/* global error:false */
/* global PaymentRequest:false */

/**
 * Updates the details based on the selected shipping address.
 * @param {object} details - The current details to update.
 * @param {ShippingAddress} addr - The shipping address selected by the user.
 * @return {object} The updated details.
 */
function updateDetails(details, addr) {
  if (addr.regionCode === 'US') {
    var shippingOption = {
      id: '',
      label: '',
      amount: {currency: 'USD', value: '0.00'}
    };
    if (addr.administrativeArea === 'CA') {
      shippingOption.id = 'ca';
      shippingOption.label = 'Free shipping in California';
      details.total.amount.value = '55.00';
    } else {
      shippingOption.id = 'us';
      shippingOption.label = 'Standard shipping in US';
      shippingOption.amount.value = '5.00';
      details.total.amount.value = '60.00';
    }
    if (details.displayItems.length === 2) {
      details.displayItems.splice(1, 0, shippingOption);
    } else {
      details.displayItems.splice(1, 1, shippingOption);
    }
    details.shippingOptions = [shippingOption];
  } else {
    delete details.shippingOptions;
  }
  return details;
}

/**
 * Launches payment request that provides different shipping options based on
 * the shipping address that the user selects.
 */
function onBuyClicked() {  // eslint-disable-line no-unused-vars
  var supportedInstruments = [
    'https://android.com/pay', 'visa', 'mastercard', 'amex', 'discover',
    'maestro', 'diners', 'jcb', 'unionpay'
  ];

  var details = {
    total: {label: 'Donation', amount: {currency: 'USD', value: '55.00'}},
    displayItems: [
      {
        label: 'Original donation amount',
        amount: {currency: 'USD', value: '65.00'}
      },
      {
        label: 'Friends and family discount',
        amount: {currency: 'USD', value: '-10.00'}
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

    request.addEventListener('shippingaddresschange', e => {
      e.updateWith(new Promise(resolve => {
        resolve(updateDetails(details, request.shippingAddress));
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
                .catch(err => {
                  error(err.message);
                });
          }, 2000);
        })
        .catch(err => {
          error(err.message);
        });
  } catch (e) {
    error('Developer mistake: \'' + e.message + '\'');
  }
}

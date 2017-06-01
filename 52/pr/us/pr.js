/* global error:false */
/* global done:false */
/* global PaymentRequest:false */

/**
 * Updates details based on shipping address.
 * @param {object} details - The details to update.
 * @param {ShippingAddress} addr - The shipping address.
 * @return {object} The updated details.
 */
function updateDetails(details, addr) {
  if (addr.regionCode === 'US') {
    var shippingOption = {
      id: '',
      label: '',
      amount: {
        currency: 'USD',
        value: '0.00'
      }
    };
    if (addr.administrativeArea === 'CA') {
      shippingOption.id = 'ca';
      shippingOption.label = 'Free shipping in California';
      details.items[details.items.length - 1].amount.value = '55.00';
    } else {
      shippingOption.id = 'us';
      shippingOption.label = 'Standard shipping in US';
      shippingOption.amount.value = '5.00';
      details.items[details.items.length - 1].amount.value = '60.00';
    }
    if (details.items.length === 3) {
      details.items.splice(-1, 0, shippingOption);
    } else {
      details.items.splice(-2, 1, shippingOption);
    }
    details.shippingOptions = [shippingOption];
  } else {
    delete details.shippingOptions;
  }
  return details;
}

/**
 * Starts PaymentRequest with shipping options that depend on the shipping
 * address.
 */
function onBuyClicked() { // eslint-disable-line no-unused-vars
  var supportedInstruments = [
    'https://android.com/pay', 'visa', 'mastercard', 'amex', 'discover',
    'maestro', 'diners', 'jcb', 'unionpay'
  ];

  var details = {
    items: [{
        id: 'original',
        label: 'Original donation amount',
        amount: {
          currency: 'USD',
          value: '65.00'
        }
      },
      {
        id: 'discount',
        label: 'Friends and family discount',
        amount: {
          currency: 'USD',
          value: '-10.00'
        }
      },
      {
        id: 'total',
        label: 'Donation',
        amount: {
          currency: 'USD',
          value: '55.00'
        }
      }
    ]
  };

  var options = {
    requestShipping: true
  };

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
                'This is a demo website. No payment will be processed.', request.shippingAddress,
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

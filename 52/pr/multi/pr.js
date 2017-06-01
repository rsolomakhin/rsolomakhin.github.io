/* global error:false */
/* global done:false */
/* global PaymentRequest:false */

/**
 * Updates details based on shipping option.
 * @param {object} details - The details to update.
 * @param {string} shippingOption - The shipping option.
 * @return {object} The updated details.
 */
function updateDetails(details, shippingOption) {
  var selectedShippingOption;
  if (shippingOption === 'standard') {
    selectedShippingOption = details.shippingOptions[0];
    details.items[details.items.length - 1].amount.value = '55.00';
  } else {
    selectedShippingOption = details.shippingOptions[1];
    details.items[details.items.length - 1].amount.value = '67.00';
  }
  if (details.items.length === 3) {
    details.items.splice(-1, 0, selectedShippingOption);
  } else {
    details.items.splice(-2, 1, selectedShippingOption);
  }
  return details;
}

/**
 * Starts PaymentRequest with shipping options independent of address.
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
    ],
    shippingOptions: [{
        id: 'standard',
        label: 'Standard shipping',
        amount: {
          currency: 'USD',
          value: '0.00'
        }
      },
      {
        id: 'express',
        label: 'Express shipping',
        amount: {
          currency: 'USD',
          value: '12.00'
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

    request.addEventListener('shippingoptionchange', e => {
      e.updateWith(new Promise(resolve => {
        resolve(updateDetails(details, request.shippingOption));
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

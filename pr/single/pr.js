/* global done:false */
/* global error:false */
/* global PaymentRequest:false */

/**
 * Launches payment request that provides free shipping worldwide.
 */
function onBuyClicked() { // eslint-disable-line no-unused-vars
  var supportedInstruments = [{
    supportedMethods: 'https://bobbucks.dev/pay',
  }];

  var details = {
    total: {
      label: 'Donation',
      amount: {
        currency: 'USD',
        value: '55.00'
      }
    },
    displayItems: [{
        label: 'Original donation amount',
        amount: {
          currency: 'USD',
          value: '65.00'
        }
      },
      {
        label: 'Friends and family discount',
        amount: {
          currency: 'USD',
          value: '-10.00'
        }
      },
      {
        label: 'Free worldwide shipping',
        amount: {
          currency: 'USD',
          value: '0.00'
        }
      }
    ],
    shippingOptions: [{
      id: 'freeShippingOption',
      label: 'Free worldwide shipping',
      amount: {
        currency: 'USD',
        value: '0.00'
      },
      selected: true
    }]
  };

  var options = {
    requestShipping: true
  };

  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    var request = new PaymentRequest(supportedInstruments, details, options);

    if (request.canMakePayment) {
      request.canMakePayment().then(function(result) {
        info(result ? "Can make payment" : "Cannot make payment");
      }).catch(function(err) {
        error(err);
      });
    }

    if (request.hasEnrolledInstrument) {
      request.hasEnrolledInstrument().then(function(result) {
        info(result ? "Has enrolled instrument" : "No enrolled instrument");
      }).catch(function(err) {
        error(err);
      });
    }

    request.addEventListener('shippingaddresschange', function(e) {
      e.updateWith(new Promise(function(resolve) {
        // No changes in price based on shipping address change.
        resolve(details);
      }));
    });

    request.addEventListener('shippingoptionchange', function(e) {
      e.updateWith(new Promise(function(resolve) {
        resolve(details);
      }));
    });

    request.show()
      .then(function(instrumentResponse) {
          instrumentResponse.complete('success')
            .then(function() {
              done('This is a demo website. No payment will be processed.', instrumentResponse);
            })
            .catch(function(err) {
              error(err);
            });
      })
      .catch(function(err) {
        error(err);
      });
  } catch (e) {
    error('Developer mistake: \'' + e.message + '\'');
  }
}

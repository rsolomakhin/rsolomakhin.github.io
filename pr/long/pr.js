/* global done:false */
/* global error:false */
/* global PaymentRequest:false */

/**
 * Launches payment request that does not require shipping.
 */
function onBuyClicked() { // eslint-disable-line no-unused-vars
  var supportedInstruments = [{
    supportedMethods: 'basic-card'
  }];

  var details = {
    total: {
      label: 'Donation donation donation donation donation donation donation donation donation donation',
      amount: {
        currency: 'USD',
        value: '55.00'
      }
    },
    displayItems: [{
        label: 'Original donation amount amount amount amount amount amount amount amount amount amount',
        amount: {
          currency: 'USD',
          value: '65.00'
        }
      },
      {
        label: 'Friends and family discount discount discount discount discount discount discount discount discount discount',
        amount: {
          currency: 'USD',
          value: '-10.00'
        }
      }
    ]
  };

  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    var request = new PaymentRequest(supportedInstruments, details);
    request.show()
      .then(function(instrumentResponse) {
        window.setTimeout(function() {
          instrumentResponse.complete('success')
            .then(function() {
              done('This is a demo website. No payment will be processed.', instrumentResponse);
            })
            .catch(function(err) {
              error(err);
            });
        }, 2000);
      })
      .catch(function(err) {
        error(err);
      });
  } catch (e) {
    error('Developer mistake: \'' + e.message + '\'');
  }
}

/* global done:false */
/* global error:false */
/* global PaymentRequest:false */

/**
 * Initializes the payment request object.
 */
function buildPaymentRequest() {
  if (!window.PaymentRequest) {
    return null;
  }

  var supportedInstruments = [
    {
      supportedMethods: 'basic-card',
    },
  ];

  var details = {
    total: {
      label: 'Donation',
      amount: {
        currency: 'USD',
        value: '1.00',
        pending: true,
      },
    },
  };

  var request = null;

  try {
    request = new PaymentRequest(supportedInstruments, details);
    if (request.canMakePayment) {
      request
        .canMakePayment()
        .then(function(result) {
          info(result ? 'Can make payment' : 'Cannot make payment');
        })
        .catch(function(err) {
          error(err);
        });
    }
  } catch (e) {
    error("Developer mistake: '" + e + "'");
  }

  return request;
}

var request = buildPaymentRequest();

/**
 * Launches payment request for credit cards.
 */
function onBuyClicked() {
  // eslint-disable-line no-unused-vars
  if (!window.PaymentRequest || !request) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    request
      .show(
        new Promise(function(resolve, reject) {
          info('Calculating final price...');
          window.setTimeout(function() {
            error('Failed to calculate the final price!');
            reject();
          }, 5000); // 5 seconds.
        }),
      )
      .then(function(instrumentResponse) {
        window.setTimeout(function() {
          instrumentResponse
            .complete('success')
            .then(function() {
              done(
                'This is a demo website. No payment will be processed.',
                instrumentResponse,
              );
            })
            .catch(function(err) {
              error(err);
              request = buildPaymentRequest();
            });
        }, 2000);
      })
      .catch(function(err) {
        error(err);
        request = buildPaymentRequest();
      });
  } catch (e) {
    error("Developer mistake: '" + e + "'");
    request = buildPaymentRequest();
  }
}

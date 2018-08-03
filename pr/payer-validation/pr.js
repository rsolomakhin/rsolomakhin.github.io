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
      label: 'Total',
      amount: {
        currency: 'USD',
        value: '1.00',
      },
    }
  };

  var options = {requestPayerEmail: true};

  var request = null;

  try {
    request = new PaymentRequest(supportedInstruments, details, options);
  } catch (e) {
    error("Developer mistake: '" + e + "'");
  }

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
      .show()
      .then(function(instrumentResponse) {
        validateResponse(instrumentResponse)
          .then(function() {
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
          });
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

function validateResponse(response) {
  return new Promise(resolver => {
    window.setTimeout(function() {
      if (!response.payerEmail || response.payerEmail != "test@email.com") {
        response.retry({ payer: { email: "The email should be \"test@email.com\"." }})
          .then(function() {
            resolver(validateResponse(response));
          });
      } else {
        resolver();
      }
    }, 2000);
  });
}

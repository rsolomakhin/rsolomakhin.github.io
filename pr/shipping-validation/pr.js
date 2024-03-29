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
      supportedMethods: 'https://bobbucks.dev/pay',
    },
  ];

  var details = {
    total: {
      label: 'Total',
      amount: {
        currency: 'USD',
        value: '1.00',
      },
    },
    shippingOptions: [{
      id: 'freeShippingOption',
      label: 'Free shipping',
      amount: {
        currency: 'USD',
        value: '0.00'
      },
      selected: true
    }]
  };

  var options = {requestShipping: true};

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
    if (!response.retry) {
      error('PaymentResponse.retry() is not defined. Is chrome://flags/#enable-experimental-web-platform-features enabled?');
      return;
    }

      if (!response.shippingAddress || response.shippingAddress.postalCode != "12345") {
        var postalCodeError = document.querySelector("#postal-code-error").value;
        response.retry({ shippingAddress: { postalCode: postalCodeError }})
          .then(function() {
            resolver(validateResponse(response));
          });
      } else {
        resolver();
      }
  });
}

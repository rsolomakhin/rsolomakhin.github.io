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

  var options = {requestShipping: true, requestPayerEmail: true};

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
          .then(function(status) {
            let isSuccess = (status === 'success');
            let simulatedProcessingTime = 2000;
            if (!isSuccess) {
              simulatedProcessingTime = 10;
            }
            window.setTimeout(function() {
              instrumentResponse
                .complete(status)
                .then(function() {
                  if (isSuccess) {
                    done(
                      'This is a demo website. No payment will be processed.',
                      instrumentResponse,
                    );
                  } else {
                    error('Transaction failed');
                  }
                })
                .catch(function(err) {
                  error(err);
                  request = buildPaymentRequest();
                });
            }, simulatedProcessingTime);
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

    info('Validating...');
    window.setTimeout(function() {
      const errors = validateShippingAddressAndPayerInfo(response);
      if (Object.keys(errors).length > 0) {
          response.retry(errors).then(() => {
            resolver(validateResponse(response));
          }).catch(e => {
            error("Developer mistake: '" + e + "'");
            resolver('fail');
          });
      } else {
        resolver('success');
      }
    }, 2000);
  });
}

function validateShippingAddressAndPayerInfo(response) {
  const errors = {};
  if (!response.shippingAddress || response.shippingAddress.postalCode != "12345") {
    let postalCodeError = document.querySelector("#postal-code-error").value;
    errors['shippingAddress'] = { postalCode: postalCodeError };
  }
  if (!response.payerEmail || response.payerEmail != "test@email.com") {
    let emailError = document.querySelector("#email-error").value;
    errors['payer'] = { email: emailError };
  }
  return errors;
}

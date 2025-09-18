/**
 * Initializes the payment request object.
 * @return {PaymentRequest} The payment request object.
 */
function buildPaymentRequest() {
  if (!window.PaymentRequest) {
    error('Payment Request API is not supported or not enabled.');
    return null;
  }

  const returnValue = document.getElementById('returnValue').value;
  const supportedInstruments = [{
    supportedMethods: 'https://bobbucks.dev/pay',
    data: {
      testField: 'test value',
      returnValue,
    },
  }];

  const details = {
    total: {
      label: 'Total',
      amount: {
        currency: 'USD',
        value: '0.01',
      },
    },
  };

  let request = null;

  try {
    request = new PaymentRequest(supportedInstruments, details);
    if (request.canMakePayment) {
      request.canMakePayment().then(function(result) {
        info(result ? 'Can make payment' : 'Cannot make payment');
      }).catch(function(err) {
        info(err.toString());
      });
    }
    if (request.hasEnrolledInstrument) {
      request.hasEnrolledInstrument().then(function(result) {
        info(result ? 'Has enrolled instrument' : 'No enrolled instrument');
      }).catch(function(err) {
        info(err.toString());
      });
    }
  } catch (e) {
    error('Developer mistake: \'' + e.message + '\'');
  }

  request.addEventListener('paymentmethodchange', e => {
    info('"paymentmethodchange" called on request with method name ' + e.methodName);
    info('Responding with an error, for testing');
    e.updateWith({error: 'Error for testing'});
  });

  return request;
}

let request = buildPaymentRequest();

/**
 * Handles the response from PaymentRequest.show().
 */
function handlePaymentResponse(response) {
    response.complete('success')
      .then(function() {
        dismissPageDimmer();
        info(JSON.stringify(response, undefined, 2));
        request = buildPaymentRequest();
      })
      .catch(function(err) {
        dismissPageDimmer();
        error(err);
        request = buildPaymentRequest();
      });
}

/**
 * Launches payment request for Bob Pay.
 */
function onBuyClicked() { // eslint-disable-line no-unused-vars
  if (!window.PaymentRequest || !request) {
    error('Payment Request API is not supported or not enabled.');
    return;
  }

  try {
    showPageDimmer();
    request.show()
      .then(handlePaymentResponse)
      .catch(function(err) {
        error(err);
        request = buildPaymentRequest();
      });
  } catch (e) {
    error('Developer mistake: \'' + e.message + '\'');
    request = buildPaymentRequest();
  }
}

function onReturnValueChanged() {
  request = buildPaymentRequest();
}

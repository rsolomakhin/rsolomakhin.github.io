/**
 * Initializes the payment request object with the selected malicious app type.
 * @return {PaymentRequest} The payment request object.
 */
function buildPaymentRequest() {
  if (!window.PaymentRequest) {
    error('Payment Request API is not supported or not enabled.');
    return null;
  }

  const appTypeElement = document.getElementById('appType');
  const appType = appTypeElement ? appTypeElement.value : '';

  const data = {
    testField: 'test value',
  };
  if (appType) {
    data.appType = appType;
  }

  const supportedInstruments = [{
    supportedMethods: 'https://bobbucks.dev/pay',
    data: data,
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
  } catch (e) {
    error('Developer mistake: \'' + e.message + '\'');
  }

  return request;
}

/**
 * Handles the response from PaymentRequest.show().
 * @param {PaymentResponse} response
 */
function handlePaymentResponse(response) {
  response.complete('success')
    .then(function() {
      dismissPageDimmer();
      info(JSON.stringify(response, undefined, 2));
    })
    .catch(function(err) {
      dismissPageDimmer();
      error(err);
    });
}

/**
 * Launches payment request for Bob Pay with current appType.
 */
function onBuyClicked() { // eslint-disable-line no-unused-vars
  const request = buildPaymentRequest();
  if (!window.PaymentRequest || !request) {
    error('Payment Request API is not supported or not enabled.');
    return;
  }

  try {
    showPageDimmer();
    request.show()
      .then(handlePaymentResponse)
      .catch(function(err) {
        dismissPageDimmer();
        error(err);
      });
  } catch (e) {
    dismissPageDimmer();
    error('Developer mistake: \'' + e.message + '\'');
  }
}

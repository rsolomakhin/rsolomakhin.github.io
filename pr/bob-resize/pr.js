/**
 * Initializes the payment request object with the selected window size
 * options.
 * @return {PaymentRequest} The payment request object.
 */
function buildPaymentRequest() {
  if (!window.PaymentRequest) {
    error('Payment Request API is not supported or not enabled.');
    return null;
  }

  // resizeTest asks the payment app to show its window.resizeTo() test
  // controls.
  const data = {
    testField: 'test value',
    resizeTest: true,
  };

  // Passed by the payment app to openWindow(url, {preferredSize}). The values
  // are sent as-is, so that invalid sizes (e.g. 0) can be tested too.
  if (document.getElementById('sendPreferredSize').checked) {
    data.preferredSize = {
      width: Number(document.getElementById('width').value),
      height: Number(document.getElementById('height').value),
    };
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
 * Launches payment request for Bob Pay with the current size options.
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

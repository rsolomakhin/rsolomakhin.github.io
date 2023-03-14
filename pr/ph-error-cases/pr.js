/**
 * Initializes the payment request object.
 * @return {PaymentRequest} The payment request object.
 */
function buildPaymentRequest(appName) {
  if (!window.PaymentRequest) {
    return null;
  }

  const supportedInstruments = [{
    supportedMethods: `https://rsolomakhin.github.io/pr/apps/with-errors/${appName}/payment_method_manifest.json`
  }];

  const details = {
    total: {
      label: 'Donation',
      amount: {
        currency: 'USD',
        value: '55.00',
      },
    },
    displayItems: [{
      label: 'Original donation amount',
      amount: {
        currency: 'USD',
        value: '65.00',
      },
    }, {
      label: 'Friends and family discount',
      amount: {
        currency: 'USD',
        value: '-10.00',
      },
    }],
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
 */
function handlePaymentResponse(response) {
    response.complete('success')
      .then(function() {
        done('This is a demo website. No payment will be processed.', response);
      })
      .catch(function(err) {
        error(err);
      });
}

/**
 * Launches payment request for Bob Pay.
 */
function onBuyClicked(appName) { // eslint-disable-line no-unused-vars
  let request = buildPaymentRequest(appName);

  if (!window.PaymentRequest || !request) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    request.show()
      .then(handlePaymentResponse)
      .catch(function(err) {
        error(err);
      });
  } catch (e) {
    error('Developer mistake: \'' + e.message + '\'');
  }
}

/**
 * Initializes the payment request object.
 * @return {PaymentRequest} The payment request object.
 */
function buildPaymentRequest() {
  if (!window.PaymentRequest) {
    return null;
  }

  const supportedInstruments = [{
    supportedMethods: 'https://bobbucks.dev/pay'
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

  return request;
}

let request = buildPaymentRequest();

/**
 * Handles the response from PaymentRequest.show().
 */
function handlePaymentResponse(response) {
    response.complete('success')
      .then(function() {
        info(JSON.stringify(response));
        request = buildPaymentRequest();
      })
      .catch(function(err) {
        error(err);
        request = buildPaymentRequest();
      });
}

/**
 * Launches payment request for Bob Pay.
 */
function onBuyClicked() { // eslint-disable-line no-unused-vars
  if (!window.PaymentRequest || !request) {
    error('PaymentRequest API is not supported.');
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

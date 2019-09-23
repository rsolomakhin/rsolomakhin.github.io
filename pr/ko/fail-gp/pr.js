/**
 * Initializes the payment request object.
 */
function buildPaymentRequest() {
  if (!window.PaymentRequest) {
    return null;
  }

  var supportedInstruments = [{
    supportedMethods: 'https://google.com/pay',
    data: {
      allowedPaymentMethods: ['TOKENIZED_CARD', 'CARD'],
      apiVersion: 1,
      cardRequirements: {
        'allowedCardNetworks': ['VISA', 'MASTERCARD', 'AMEX'],
      },
      merchantName: 'Rouslan Solomakhin',
      merchantId: '00184145120947117657',
      paymentMethodTokenizationParameters: {
        tokenizationType: 'GATEWAY_TOKEN',
        parameters: {
          'gateway': 'stripe',
          'stripe:publishableKey': 'pk_live_lNk21zqKM2BENZENh3rzCUgo',
          'stripe:version': '2016-07-06',
        },
      },
    },
  }];

  const details = {
    total: {
      label: 'Tots',
      amount: {
        currency: 'USD',
        value: '1.00',
      },
    },
  };

  var request = null;

  try {
    request = new PaymentRequest(supportedInstruments, details);

    if (request.canMakePayment) {
      request.canMakePayment().then(function(result) {
        info(result ? 'Can make payment.' : 'Cannot make payment.');
      }).catch(function(err) {
        error('Can make payment: ' + err.toString());
      });
    }

    if (request.hasEnrolledInstrument) {
      request.hasEnrolledInstrument().then(function(result) {
        info(result ? 'Has enrolled instrument.' : 'No enrolled instrument.');
      }).catch(function(err) {
        error('Has enrolled instrumentt: ' + err.toString());
      });
    }
  } catch (e) {
    error(e.toString());
  }

  return request;
}

var request = buildPaymentRequest();

/**
 * Launches payment request for credit cards.
 */
function onBuyClicked() { // eslint-disable-line no-unused-vars
  if (!window.PaymentRequest || !request) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    request.show()
    .then(function(instrumentResponse) {
      instrumentResponse.complete('fail')
      .then(function() {
        error('Transaction failed');
      })
      .catch(function(err) {
        error(err.toString());
      });
    })
    .catch(function(err) {
      error(err.toString());
    });
  } catch (e) {
    error(e.toString());
  }

  request = buildPaymentRequest();
}

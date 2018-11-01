/**
 * Initializes the payment request object.
 * @return {PaymentRequest} The payment request object.
 */
function buildPaymentRequest() {
  if (!window.PaymentRequest) {
    return null;
  }

  const supportedInstruments = [{
    supportedMethods: 'https://android.com/pay',
    data: {
      merchantName: 'Rouslan Solomakhin',
      merchantId: '00184145120947117657',
      allowedCardNetworks: ['AMEX', 'MASTERCARD', 'VISA', 'DISCOVER'],
      paymentMethodTokenizationParameters: {
        tokenizationType: 'GATEWAY_TOKEN',
        parameters: {
          'gateway': 'stripe',
          'stripe:publishableKey': 'pk_live_lNk21zqKM2BENZENh3rzCUgo',
          'stripe:version': '2016-07-06',
        },
      },
    },
  }, {
    supportedMethods: 'basic-card',
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
    modifiers: [{
      supportedMethods: 'basic-card',
      data: {
        supportedTypes: ['debit'],
      },
      total: {
        label: 'Debit card discounted donation',
        amount: {
          currency: 'USD',
          value: '45.00',
        },
      },
      additionalDisplayItems: [{
        label: 'Debit card discount',
        amount: {
          currency: 'USD',
          value: '-10.00',
        },
      }],
    }, {
      supportedMethods: 'basic-card',
      data: {
        supportedNetworks: ['mastercard'],
      },
      total: {
        label: 'MasterCard discounted donation',
        amount: {
          currency: 'USD',
          value: '50.00',
        },
      },
      additionalDisplayItems: [{
        label: 'MasterCard discount',
        amount: {
          currency: 'USD',
          value: '-5.00',
        },
      }],
    }],
  };

  let request = null;

  try {
    request = new PaymentRequest(supportedInstruments, details);
    if (request.canMakePayment) {
      request.canMakePayment().then(function(result) {
        info(result ? 'Can make payment' : 'Cannot make payment');
      }).catch(function(err) {
        error(err);
      });
    }
  } catch (e) {
    error('Developer mistake: \'' + e + '\'');
  }

  return request;
}

let request = buildPaymentRequest();

/**
 * Launches payment request that does not require shipping.
 */
function onBuyClicked() { // eslint-disable-line no-unused-vars
  if (!window.PaymentRequest || !request) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    request.show()
      .then(function(instrumentResponse) {
        window.setTimeout(function() {
          instrumentResponse.complete('success')
            .then(function() {
              done('This is a demo website. No payment will be processed.',
                instrumentResponse);
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
    error('Developer mistake: \'' + e + '\'');
    request = buildPaymentRequest();
  }
}

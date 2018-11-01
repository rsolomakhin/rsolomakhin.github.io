/**
 * Initializes the payment request object.
 * @return {PaymentRequest} The payment request object.
 */
function buildPaymentRequest() {
  if (!window.PaymentRequest) {
    return null;
  }

  var supportedInstruments = [{
    supportedMethods: 'basic-card',
  }];

  var details = {
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
      total: {
        label: 'Discounted donation',
        amount: {
          currency: 'USD',
          value: '45.00',
        },
      },
      additionalDisplayItems: [{
        label: 'VISA discount',
        amount: {
          currency: 'USD',
          value: '-10.00',
        },
      }],
      data: {
        discountProgramParticipantId: '86328764873265',
        supportedNetworks: ['visa']
      },
    }],
  };

  var request = null;

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
        instrumentResponse.complete('foo').then(function() {
          info('complete("foo") was resolved.');
        }).catch(function(err) {
          info('complete("foo") was rejected: ' + err);
        });
      })
      .catch(function(err) {
        error(err);
      });
  } catch (e) {
    error('Developer mistake: \'' + e + '\'');
  }

  request = buildPaymentRequest();
}

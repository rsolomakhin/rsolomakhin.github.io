/* global done:false */
/* global error:false */
/* global PaymentRequest:false */

var details = {
  total: {
    label: 'Total',
    amount: {
      currency: 'USD',
      value: '1.00'
    },
  },
};

/**
 * Initializes the payment request object.
 */
function buildPaymentRequest() {
  if (!window.PaymentRequest) {
    return null;
  }

  var supportedInstruments = [{
    supportedMethods: 
      'basic-card',
    
  }];

  var request = null;

  try {
    request = new PaymentRequest(supportedInstruments, details, {requestBillingAddress: true});
    if (request.canMakePayment) {
      request.canMakePayment().then(function(result) {
        info(result ? 'Can make payment' : 'Cannot make payment');
      }).catch(function(err) {
        error(err);
      });
    }
    request.addEventListener('paymentmethodchange', function(evt) {
      info(evt.methodName);
      if (evt.methodDetails) {
        info(JSON.stringify(evt.methodDetails, undefined, 2));
      }
      details.total.amount.currency = evt.methodDetails &&
          evt.methodDetails.billingAddress &&
          evt.methodDetails.billingAddress.country !== 'US' ? 'EUR' : 'USD';
      details.total.amount.value = evt.methodDetails &&
          evt.methodDetails.billingAddress &&
          evt.methodDetails.billingAddress.country !== 'US' ? '2.00' : '1.00';
      evt.respondWith(details);
    });
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
        window.setTimeout(function() {
          instrumentResponse.complete('success')
            .then(function() {
              done('This is a demo website. No payment will be processed.', instrumentResponse);
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

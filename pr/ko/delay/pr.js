/**
 * Initializes the payment request object.
 */
function buildPaymentRequest() {
  if (!window.PaymentRequest) {
    return null;
  }

  var supportedInstruments = [{
    supportedMethods: 'basic-card'
  }];

  var details = {
    total: {
      label: 'Total',
      amount: {
        currency: 'USD',
        value: '1.00'
      },
    },
  };

  var request = null;

  try {
    request = new PaymentRequest(supportedInstruments, details);
    if (request.canMakePayment) {
      request.canMakePayment().then(function(result) {
        info(result ? "Can make payment" : "Cannot make payment");
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
var is_buying = false;

/**
 * Launches payment request for credit cards.
 */
function onBuyClicked() { // eslint-disable-line no-unused-vars
  if (is_buying) {
    error('Ignoring button press.');
    return;
  }

  if (!window.PaymentRequest || !request) {
    error('PaymentRequest API is not supported.');
    return;
  }

  is_buying = true;

  var spinner = document.createElement('i');
  spinner.classList = 'fa fa-refresh fa-spin';
  var button = document.getElementById('buyButton');
  button.appendChild(spinner);

  info('Delaying show() by 5 seconds...');

  window.setTimeout(function() {
    button.removeChild(spinner);
    try {
      request.show()
        .then(function(instrumentResponse) {
          window.setTimeout(function() {
            instrumentResponse.complete('success')
              .then(function() {
                done('This is a demo website. No payment will be processed.', instrumentResponse);
                request = buildPaymentRequest();
                is_buying = false;
              })
              .catch(function(err) {
                error(err);
                request = buildPaymentRequest();
                is_buying = false;
              });
          }, 2000);
        })
        .catch(function(err) {
          error(err);
          request = buildPaymentRequest();
          is_buying = false;
        });
    } catch (e) {
      error('Developer mistake: \'' + e + '\'');
      request = buildPaymentRequest();
      is_buying = false;
    }

  }, 5000);  // 5 seconds.
}

/* exported onBuyClicked */


let intervalId = 0;

function showCounterValue(value) {
  document.getElementById('counter').innerHTML = value;
}

function startCounter() {
  let count = 0;
  showCounterValue(count);
  intervalId = window.setInterval(function() {
    showCounterValue(++count);
  }, 1000);
}

function stopCounter() {
  window.clearInterval(intervalId);
  intervalId = 0;
  showCounterValue('Stopped');
}

/**
 * Initializes the payment request object.
 * @return {PaymentRequest} The payment request object.
 */
function buildPaymentRequest() {
  if (!window.PaymentRequest) {
    return null;
  }

  // Documentation:
  // https://developers.google.com/pay/api/web/guides/tutorial
  const supportedInstruments = [{
    supportedMethods: 'https://google.com/pay',
    data: {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'VISA', 'MASTERCARD'],
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            'gateway': 'stripe',
            // Please use your own Stripe live public key.
            'stripe:publishableKey': 'pk_live_lNk21zqKM2BENZENh3rzCUgo',
            'stripe:version': '2016-07-06',
          },
        },
      }],
      transactionInfo: {
        countryCode: 'US',
        currencyCode: 'USD',
        totalPriceStatus: 'FINAL',
        totalPrice: '1.00',
      },
      // Please use your own Google Pay merchant ID.
      merchantInfo: {
        merchantName: 'Rouslan Solomakhin',
        merchantId: '00184145120947117657',
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
    displayItems: [
      { label: 'Widget #1', amount: { currency: 'USD', value: '0.75' }, },
      { label: 'Widget #2', amount: { currency: 'USD', value: '0.25' }, },
    ],
  };

  let request = null;

  try {
    request = new PaymentRequest(supportedInstruments, details);
    if (request.canMakePayment) {
      request.canMakePayment().then(function(result) {
        info(result ? "Can make payment" : "Cannot make payment");
      }).catch(function(err) {
        error(err);
      });
    }

    if (request.hasEnrolledInstrument) {
      request.hasEnrolledInstrument().then(function(result) {
        info(result ? "Has enrolled instrument" : "No enrolled instrument");
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
 * Launches payment request for Android Pay.
 */
function onBuyClicked() {
  if (!window.PaymentRequest || !request) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    startCounter();
    request.show()
      .then(function(instrumentResponse) {
        stopCounter();
        instrumentResponse.complete('success')
          .then(function() {
            done('This is a demo website. No payment will be processed.',
              instrumentResponse);
          })
          .catch(function(err) {
            error(err);
            request = buildPaymentRequest();
          });
      })
      .catch(function(err) {
        stopCounter();
        error(err);
        request = buildPaymentRequest();
      });
  } catch (e) {
    stopCounter();
    error('Developer mistake: \'' + e + '\'');
    request = buildPaymentRequest();
  }
}

/* global done:false */
/* global error:false */
/* global PaymentRequest:false */

/**
 * Initializes the payment request object.
 */
function buildPaymentRequest() {
  if (!window.PaymentRequest) {
    return null;
  }

  var supportedInstruments = [
    {
      supportedMethods: 'https://bobbucks.dev/pay',
    },
  ];

  var details = {
    total: {
      label: 'Total',
      amount: {
        currency: 'USD',
        value: '1.00',
      },
    }
  };

  var request = null;

  try {
    request = new PaymentRequest(supportedInstruments, details);
  } catch (e) {
    error("Developer mistake: '" + e + "'");
  }

  if (request.canMakePayment) {
    request
      .canMakePayment()
      .then(function(result) {
        info(result ? 'Can make payment' : 'Cannot make payment');
      })
      .catch(function(err) {
        error(err);
      });
  }

  return request;
}

var request = buildPaymentRequest();

/**
 * Launches payment request for credit cards.
 */
async function onBuyClicked() {
  // eslint-disable-line no-unused-vars
  if (!window.PaymentRequest || !request) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    const response = await request.show();
    info(`Got response; waiting 5 seconds before calling retry`);
    setTimeout(async function() {
      info(`Calling retry`);
      await response.retry({paymentMethod: { myField: 'Foo' }});
      response.complete('success');

      request = buildPaymentRequest();
    }, 5000);
  } catch (e) {
    error(e);
    request = buildPaymentRequest();
  }
}

/* exported onBuyClicked */

/**
 * Initializes the payment request object.
 * @return {PaymentRequest} The payment request object.
 */
function buildPaymentRequest() {
  if (!window.PaymentRequest) {
    return null;
  }

  const supportedInstruments = [{
    supportedMethods: 'https://pay.mope.ml',
    data: {
			supportedNetworks: ['SEPA'],
			payeeAccountNumber: 'CH2004835074622251000',
			payeeName: 'Polymer Shop',
			payeeBankCode: 'CRESCHZZXX',
			payeePaymentIdentificationHumanReadable: 'Polymer Outware Purchase',
			payeePaymentIdentifierMachineReadable: 'polyref1',
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
 * Launches payment request for Android Pay.
 */
function onBuyClicked() {
  if (!window.PaymentRequest || !request) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    request.show()
      .then(function(instrumentResponse) {
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
        error(err);
        request = buildPaymentRequest();
      });
  } catch (e) {
    error('Developer mistake: \'' + e + '\'');
    request = buildPaymentRequest();
  }
}

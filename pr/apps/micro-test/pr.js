function buildPaymentRequest() {
  if (!window.PaymentRequest) {
    return null;
  }

  let supportedInstruments = [{
    supportedMethods: 'https://rsolomakhin.github.io',
  }];

  let details = {
    total: {
      label: 'Payment',
      amount: {
        currency: 'USD',
        value: '1.00'
      }
    }
  };

  let request = null;

  try {
    request = new PaymentRequest(supportedInstruments, details);
    if (request.canMakePayment) {
      request.canMakePayment().then((result) => {
        info(result ? "Can make payment" : "Cannot make payment");
      }).catch((err) => {
        error(err.toString());
      });
    }
    if (request.hasEnrolledInstrument) {
      request.hasEnrolledInstrument().then((result) => {
        info(result ? "Has enrolled instrument" : "No enrolled instrument");
      }).catch((err) => {
        error(err.toString());
      });
    }
  } catch (e) {
    error(e.toString());
  }

  return request;
}

let request = buildPaymentRequest();

function onBuyClicked() { // eslint-disable-line no-unused-vars
  if (!window.PaymentRequest || !request) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    request.show()
      .then((instrumentResponse) => {
        instrumentResponse.complete('success')
          .then(() => {
            done('This is a demo website. No payment will be processed.', instrumentResponse);
          })
          .catch((err) => {
            error(err.toString());
            request = buildPaymentRequest();
          });
      })
      .catch((err) => {
        error(err.toString());
        request = buildPaymentRequest();
      });
  } catch (e) {
    error(e.toString());
    request = buildPaymentRequest();
  }
}

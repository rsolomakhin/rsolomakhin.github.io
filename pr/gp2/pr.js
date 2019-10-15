/* exported onBuyClicked */

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
  const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
  };

  const tokenizationSpecification = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
      'gateway': 'stripe',
      'stripe:publishableKey': 'pk_live_lNk21zqKM2BENZENh3rzCUgo',
      'stripe:version': '2016-07-06',
    },
  };
  
  const allowedCardNetworks = ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'VISA',
      'MASTERCARD'];

  const allowedCardAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];

  const baseCardPaymentMethod = {
    type: 'CARD',
    parameters: {
      allowedAuthMethods: allowedCardAuthMethods,
      allowedCardNetworks: allowedCardNetworks,
    },
  };

  const cardPaymentMethod = Object.assign(
    {},
    baseCardPaymentMethod,
    {
      tokenizationSpecification: tokenizationSpecification,
    },
  );

  const paymentDataRequest = Object.assign({}, baseRequest);
  paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod];
  paymentDataRequest.transactionInfo = {
    countryCode: 'US',
    currencyCode: 'USD',
    totalPriceStatus: 'FINAL',
    totalPrice: '1.00',
  };
  paymentDataRequest.merchantInfo = {
    merchantName: 'Rouslan Solomakhin',
    merchantId: '00184145120947117657',
  };

  const supportedInstruments = [{
    supportedMethods: 'https://google.com/pay',
    data: paymentDataRequest,
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

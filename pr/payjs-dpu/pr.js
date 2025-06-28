let baseRequest;
let baseCardPaymentMethod;
let paymentsClient;
try {
  baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
  };
  const allowedCardNetworks = ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA'];
  const allowedCardAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];
  baseCardPaymentMethod = {
    type: 'CARD',
    parameters: {
      allowedAuthMethods: allowedCardAuthMethods,
      allowedCardNetworks: allowedCardNetworks,
    },
  };
} catch (err) {
  error(JSON.stringify(err, undefined, 2));
}

function onPaymentAuthorized(paymentData) {
  return new Promise(function(resolve, reject) {
    info(`Processing transaction: Success.`);
    resolve({transactionState: 'SUCCESS'});
  });
}

function onPaymentDataChanged(paymentData) {
  return new Promise(function(resolve, reject) {
    info(`Received payment data update.`);
    resolve();
  });
}

async function payButtonClickHandler() {
  try {
    const tokenizationSpecification = {
      type: 'PAYMENT_GATEWAY',
      parameters: {
      gateway: 'stripe',
      'stripe:version': '2018-10-31',
      // Please use your own Stripe live public key.
      'stripe:publishableKey': 'pk_live_lNk21zqKM2BENZENh3rzCUgo',
      }
    };
    const cardPaymentMethod = Object.assign(
      {tokenizationSpecification: tokenizationSpecification},
      baseCardPaymentMethod,
    );
    const paymentDataRequest = Object.assign({}, baseRequest);
    paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod];
    paymentDataRequest.transactionInfo = {
      totalPriceStatus: 'FINAL',
      totalPrice: '1.00',
      currencyCode: 'USD',
      countryCode: 'US',
    };
    // Please use your own Google Pay merchant ID.
    paymentDataRequest.merchantInfo = {
      merchantName: 'Rouslan Solomakhin',
      merchantId: '00184145120947117657',
    };
    paymentDataRequest.callbackIntents = ['SHIPPING_ADDRESS',  'SHIPPING_OPTION', 'PAYMENT_AUTHORIZATION'];
    paymentDataRequest.shippingAddressRequired = true;
    paymentDataRequest.shippingOptionRequired = true;
    const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
    info(JSON.stringify(paymentData, undefined, 2));
  } catch (err) {
    error(JSON.stringify(err, undefined, 2));
  }
}

async function addPayButton() {
  try {
    paymentsClient = new google.payments.api.PaymentsClient({
      environment:'PRODUCTION',
      paymentDataCallbacks : {
        onPaymentAuthorized: onPaymentAuthorized,
        onPaymentDataChanged: onPaymentDataChanged,
      },
    });
    const isReadyToPayRequest = Object.assign({}, baseRequest);
    isReadyToPayRequest.allowedPaymentMethods = [baseCardPaymentMethod];
    const isReadyToPayResponse = await paymentsClient.isReadyToPay(isReadyToPayRequest);
    if (!isReadyToPayResponse.result) {
      error("Not ready to pay");
      return;
    }
    const button = paymentsClient.createButton({onClick: payButtonClickHandler});
    document.getElementById('buttonContainer').appendChild(button);
  } catch (err) {
    error(JSON.stringify(err, undefined, 2));
  }
}

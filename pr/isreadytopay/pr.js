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
    const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
    info(JSON.stringify(paymentData, undefined, 2));
  } catch (err) {
    error(JSON.stringify(err, undefined, 2));
  }
}

async function addPayButton() {
  try {
    paymentsClient = new google.payments.api.PaymentsClient({environment:'PRODUCTION'});
    const isReadyToPayRequest = Object.assign({}, baseRequest);
    isReadyToPayRequest.allowedPaymentMethods = [baseCardPaymentMethod];
    isReadyToPayRequest.existingPaymentMethodRequired = true;
    const isReadyToPayResponse = await paymentsClient.isReadyToPay(isReadyToPayRequest);
    document.getElementById("result").innerText = isReadyToPayResponse.result ? "✅" : "❌";
    document.getElementById("paymentMethodPresent").innerText = isReadyToPayResponse.paymentMethodPresent ? "✅" : "❌";
    if (!isReadyToPayResponse.result || !isReadyToPayResponse.paymentMethodPresent) {
      error("Not ready to pay");
      return;
    }
    const button = paymentsClient.createButton({onClick: payButtonClickHandler});
    document.getElementById('buttonContainer').appendChild(button);
  } catch (err) {
    error(JSON.stringify(err, undefined, 2));
  }
}

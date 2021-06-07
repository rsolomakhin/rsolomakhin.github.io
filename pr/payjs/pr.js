const baseRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,
};
const tokenizationSpecification = {
  type: 'PAYMENT_GATEWAY',
  parameters: {
  gateway: 'stripe',
  'stripe:version': '2018-10-31',
  // Please use your own Stripe live public key.
  'stripe:publishableKey': 'pk_live_lNk21zqKM2BENZENh3rzCUgo',
  }
};
const allowedCardNetworks = ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA'];
const allowedCardAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];
const baseCardPaymentMethod = {
  type: 'CARD',
  parameters: {
    allowedAuthMethods: allowedCardAuthMethods,
    allowedCardNetworks: allowedCardNetworks,
  },
};

async function payButtonClickHandler() {
  try {
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
    done('This is a demo website. No payment will be processed.', paymentData);
  } catch (err) {
    error(err);
  }
}

async function addPayButton() {
  try {
    const cardPaymentMethod = Object.assign(
      {tokenizationSpecification: tokenizationSpecification},
      baseCardPaymentMethod,
    );
    const paymentsClient = new google.payments.api.PaymentsClient();
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
    error(err);
  }
}

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
        gateway: 'example',      
        gatewayMerchantId: 'exampleGatewayMerchantId',
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
      merchantName: 'Example Merchant',
      merchantId: '12345678901234567890',
    };
    const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
    info(JSON.stringify(paymentData, undefined, 2));
  } catch (err) {
    error(JSON.stringify(err, undefined, 2));
  }
}

async function addPayButton() {
  try {
    paymentsClient = new google.payments.api.PaymentsClient({environment:'TEST'});
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

/* global done:false */
/* global error:false */
/* global PaymentRequest:false */

/**
 * Initializes the payment request object.
 */
async function buildPaymentRequest() {
  const supportedInstruments = [
    {
      supportedMethods: 'basic-card',
    },
  ];
  const details = {
    total: {
      label: 'Total',
      amount: {
        currency: 'USD',
        value: '1.00',
      },
    },
    shippingOptions: [{
      id: 'freeShippingOption',
      label: 'Free shipping',
      amount: {
        currency: 'USD',
        value: '0.00'
      },
      selected: true
    }]
  };
  const options = {requestShipping: true};
  const request = new PaymentRequest(supportedInstruments, details, options);
  info(`${await request.canMakePayment() ? "Can" : "Cannot"} make payment.`);
  return request;
}

/**
 * Launches payment request for credit cards.
 */
async function onBuyClicked() {
  try {
    const request = await buildPaymentRequest();
    const response = await request.show();
    await validateResponse(response);
  } catch(err) {
    error(`Developer mistake: '${err}'`);
    throw err;
  }
  await response.complete('success');
}

async function validateResponse(response) {
  if (response.shippingAddress.postalCode !== "12345") {
    await response.retry({ shippingAddress: { postalCode: "The postal code should be 12345." }});
  }
  await validateResponse(response)
}

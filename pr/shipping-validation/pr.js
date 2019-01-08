const supportedInstruments = [
  {
    supportedMethods: "basic-card",
  },
];
const details = {
  total: {
    label: "Total",
    amount: {
      currency: "USD",
      value: "1.00",
    },
  },
  shippingOptions: [
    {
      id: "freeShippingOption",
      label: "Free shipping",
      amount: {
        currency: "USD",
        value: "0.00",
      },
      selected: true,
    },
  ],
};

async function buildPaymentRequest() {
  const options = { requestShipping: true };
  const request = new PaymentRequest(supportedInstruments, details, options);
  info(`${(await request.canMakePayment()) ? "Can" : "Cannot"} make payment.`);
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
    await response.complete("success");
  } catch (err) {
    error(`Developer mistake: '${err}'`);
    throw err;
  }
}

async function validateResponse(response) {
  const {
    shippingAddress: { postalCode },
  } = response;

  if (postalCode === "12345") return; // valid!

  await response.retry({
    shippingAddress: { postalCode: "The postal code should be 12345." },
  });
  await validateResponse(response);
}

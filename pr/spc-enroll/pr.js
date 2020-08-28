/* exported createPaymentCredential */
/* exported onBuyClicked */

const textEncoder = new TextEncoder();

/**
 * Initializes the payment request object.
 * @return {PaymentRequest} The payment request object.
 */
async function buildPaymentRequest() {
  if (!window.PaymentRequest) {
    return null;
  }

  let request = null;

  try {
    // Documentation:
    // https://github.com/rsolomakhin/secure-payment-confirmation
    const supportedInstruments = [{
      supportedMethods: ["https://lumbar-brick-soup.glitch.me/method-manifest"]
    }];

    const details = {
      total: {
        label: 'Total',
        amount: {
          currency: 'USD',
          value: '0.01',
        },
      },
    };

    request = new PaymentRequest(supportedInstruments, details);
  } catch (err) {
    error(err);
  }

  return request;
}

/**
 * Launches payment request for Android Pay.
 */
async function onBuyClicked() {
  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }

  const request = await buildPaymentRequest();
  if (!request)
    return;

  try {
    const instrumentResponse = await request.show();
    await instrumentResponse.complete('success')
    info(JSON.stringify(instrumentResponse, undefined, 2));
  } catch (err) {
    error(err);
  }
}

async function checkCanMakePayment() {
  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }
  try {
    const request = await buildPaymentRequest();
    if (!request)
      return;
    const result = await request.canMakePayment();
    info(result ? "Can make payment." : "Cannot make payment");
  } catch (err) {
    error(err);
  }
}

checkCanMakePayment();

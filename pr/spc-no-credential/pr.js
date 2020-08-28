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
      supportedMethods: 'secure-payment-confirmation',
      data: {
        action: 'authenticate',
        credentialIds: [Uint8Array.from(
            atob(window.localStorage.getItem('no_credential_identifier')),
            c => c.charCodeAt(0))],
        networkData: textEncoder.encode('network_data'),
        timeout: 60000,
        fallbackUrl: 'https://rsolomakhin.github.io/pr/spc/fallback'
      },
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
    const result = await request.canMakePayment();
    info(result ? "Can make payment" : "Cannot make payment");
    const hEI = await request.hasEnrolledInstrument();
    info(hEI ? "Has enrolled instrument" : "No enrolled instrument");
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

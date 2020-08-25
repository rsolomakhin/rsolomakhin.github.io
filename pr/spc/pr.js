/* exported createPaymentCredential */
/* exported onBuyClicked */

const textEncoder = new TextEncoder();

/**
 * Creates a payment credential.
 */
async function createPaymentCredential() {
  const rp = {
    id: 'rsolomakhin.github.io',
    name: 'Rouslan Solomakhin',
  };
  const instrument = {
    displayName: 'Display name for instrument',
    icon: 'https://rsolomakhin.github.io/micro.png',
  };
  const pubKeyCredParams = [{
    type: 'public-key',
    alg: -7,
  }];
  const authenticatorSelection = {
    userVerification: "required",
  };
  const payment = {
    rp,
    instrument,
    challenge: textEncoder.encode('Transaction approval challenge'),
    pubKeyCredParams,
    authenticatorSelection,
  };
  try {
    const publicKeyCredential = await navigator.credentials.create({payment});
    window.localStorage.setItem('credential_identifier', publicKeyCredential.id);
    info('Credential enrolled.');
  } catch (err) {
    error(err);
  }
}

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
          atob(window.localStorage.getItem('credential_identifier')),
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
    info('This is a demo website. No payment will be processed. ' +
        JSON.stringify(instrumentResponse, undefned, 2));
  } catch (err) {
    error(err);
  }
}

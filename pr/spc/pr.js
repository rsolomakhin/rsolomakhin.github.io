/* exported createPaymentCredential */
/* exported onBuyClicked */

const textEncoder = new TextEncoder();
let credentialIdentifier = Uint8Array.from('stub_credential', c => c.charCodeAt(0));

/**
 * Creates a payment credential.
 */
async function createPaymentCredential() {
  const instrument = {
    displayName: 'Display name for instrument',
    icon: 'https://rsolomakhin.github.io/micro.png',
  };
  const rp = {
    id: 'rsolomakhin.github.io',
    name: 'Rouslan Solomakhin',
  };
  const pubKeyCredParams = [{
    type: 'public-key',
    alg: -7,
  }];
  const payment = {
    rp,
    instrument,
    challenge: textEncoder.encode('Transaction approval challenge'),
    pubKeyCredParams,
  };
  try {
    const publicKeyCredential = await navigator.credentials.create({payment});
    credentialIdentifier = publicKeyCredential.rawId;
  } catch (err) {
    error(err);
  }
}

/**
 * Initializes the payment request object.
 * @return {PaymentRequest} The payment request object.
 */
function buildPaymentRequest() {
  if (!window.PaymentRequest) {
    return null;
  }

  // Documentation:
  // https://github.com/rsolomakhin/secure-payment-confirmation
  const supportedInstruments = [{
    supportedMethods: 'secure-payment-confirmation',
    data: {
      action: 'authenticate',
      credentialIds: [credentialIdentifier],
      networkData: Uint8Array.from('network_data', c => c.charCodeAt(0)),
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

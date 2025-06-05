/**
 * Initializes the payment request object.
 * @return {PaymentRequest} The payment request object.
 */
function buildApplePayPaymentRequest() {
  if (!window.PaymentRequest) {
    return null;
  }

  const supportedInstruments = [{
    "supportedMethods": "https://apple.com/apple-pay",
    "data": {
        "version": 3,
        // TODO: Should we register for our own merchantIdentifier? This is
        // taken from https://applepaydemo.apple.com/payment-request-api
        "merchantIdentifier": "merchant.com.apdemo",
        "merchantCapabilities": [
            "supports3DS"
        ],
        "supportedNetworks": [
            "amex",
            "discover",
            "masterCard",
            "visa"
        ],
        "countryCode": "US"
    }
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

  try {
    const request = new PaymentRequest(supportedInstruments, details);
    if (request.canMakePayment) {
      request.canMakePayment().then(function(result) {
        info(result ? 'Apple Pay (polyfilled): Can make payment.' : 'Apple Pay (polyfilled): Cannot make payment.');
      }).catch(function(err) {
        error('Apple Pay (polyfilled) can make payment error: \'' + err.message + '\'');
      });
    }
    return request;
  } catch (e) {
    error('Apple Pay (polyfilled) error: \'' + e.message + '\'');
    return null;
  }
}

/**
 * Handles the response from PaymentRequest.show().
 */
async function handleApplePayResponse(response) {
    if (!response) {
      done('Apple Pay (polyfilled) returned "undefined" response.');
      return;
    }
    if (!response.complete) {
      done('Apple Pay (polyfilled) returned a response without complete() method.');
      return;
    }
    try {
      await response.complete('success')
      done('Apple Pay (polyfilled): This is a demo website. No payment will be processed.');
    } catch (err) {
      error('Apple Pay (polyfilled) complete() error: \'' + err.message + '\'');
      applePayRequest = buildApplePayPaymentRequest();
    }
}

function buildSpcPaymentRequest(windowLocalStorageIdentifier) {
  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return null;
  }

  try {
    const request = createSPCPaymentRequest({
      credentialIds: [base64ToArray(
          window.localStorage.getItem(windowLocalStorageIdentifier))],
      // `browserBoundPubKeyCredParams` does not need to be set and will default
      // to the same values listed here.
      browserBoundPubKeyCredParams: [
        {
          type: 'public-key',
          alg:
              -7,  // ECDSA with SHA-256 (See
                   // https://www.iana.org/assignments/cose/cose.xhtml#algorithms)
        },
        {
          type: 'public-key',
          alg:
              -257,  // RSA with SHA-256 (See
                     // https://www.iana.org/assignments/cose/cose.xhtml#algorithms)
        }
      ]
    });
    request.canMakePayment().then((result) => {
      info(result ? 'SPC (polyfilled): Can make payment.' : 'SPC (polyfilled): Cannot make payment.');
    }).catch((error) => {
      error(`SPC (polyfilled): Error from canMakePayment: ${error.message}`);
    });
    request.hasEnrolledInstrument().then((result) => {
      info(result ? 'SPC (polyfilled): Has enrolled instrument.' : 'SPC (polyfilled): No enrolled instrument.');
    }).catch((error) => {
      error(`SPC (polyfilled): Error from hasEnrolledInstrument: ${error.message}`);
    });
    return request;
  } catch (err) {
    error('SPC (polyfilled) error: \'' + err + '\'');
    return null;
  }
}

/**
 * Launches payment request for SPC.
 */
async function onSpcBuyClicked() {
  if (!window.PaymentRequest || !spcRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    const instrumentResponse = await spcRequest.show();
    await instrumentResponse.complete('success')
    info(instrumentResponse);
    info('SPC (polyfilled): payment response: ' + objectToString(instrumentResponse));
  } catch (err) {
    error('SPC (polyfilled) error: \'' + err.message + '\'');
  }
}

/**
 * Launches payment request for Apple Pay.
 */
async function onApplePayBuyClicked() {
  if (!window.PaymentRequest || !applePayRequest) {
    error('Apple Pay (polyfilled): PaymentRequest API is not supported.');
    return;
  }

  // Temporary, for testing background tab behavior.
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    const response = await applePayRequest.show();
    await handleApplePayResponse(response);
  } catch (e) {
    error('Apple Pay (polyfilled) error: \'' + e.message + '\'');
    applePayRequest = buildApplePayPaymentRequest();
  }
}

class PaymentResponsePolyfill {
  constructor() {
    this.details_ = {'key': 'value'};
  }

  toJSON() {
    return this.details_;
  }

  complete(result, details) {
    info('PaymentResponsePolyfill.complete()');
    return Promise.resolve();
  }

  get requestId() {
    return 'requestId';
  }

  get methodName() {
    return 'secure-payment-confirmation';
  }

  get details() {
    return this.details_;
  }
}

class PaymentRequestPolyfill {
  constructor(methodData, details, options) {
    info('new PaymentRequestPolyfill([{supportedMethods: "'+ methodData[0].supportedMethods +'"}])');
  }

  show(optionalPromise) {
    info('PaymentRequestPolyfill().show()');
    alert('PaymentRequestPolyfill().show()');
    return Promise.resolve(new PaymentResponsePolyfill());
  }

  canMakePayment() {
    info('PaymentRequestPolyfill().canMakePayment()');
    return Promise.resolve(true);
  }

  hasEnrolledInstrument() {
    info('PaymentRequestPolyfill().hasEnrolledInstrument()');
    return Promise.resolve(true);
  }
}

let ActualPaymentRequest;

function polyfillPaymentRequest() {
  ActualPaymentRequest = window.PaymentRequest;
  window.PaymentRequest = function(methodData, details, options) {
    const method = (methodData
                    && methodData instanceof Array
                    && methodData.length > 0
                    && methodData[0]
                    && methodData[0].supportedMethods)
            ?  methodData[0].supportedMethods
            : 'UNKNOWN';
    info('new PaymentRequest([{supportedMethods: "'+ method +'"}])');
    if (method === 'secure-payment-confirmation') {
      return new PaymentRequestPolyfill(methodData, details, options);
    } else {
      return new ActualPaymentRequest(methodData, details, options);
    }
  };
}

// main:
polyfillPaymentRequest();
let applePayRequest = buildApplePayPaymentRequest();
let spcRequest = buildSpcPaymentRequest('Credential #1');

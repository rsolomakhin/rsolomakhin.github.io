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
        info(result ? 'Apple Pay: Can make payment.' : 'Apple Pay: Cannot make payment.');
      }).catch(function(err) {
        error('Apple Pay can make payment error: \'' + err.message + '\'');
      });
    }
    return request;
  } catch (e) {
    error('Apple Pay error: \'' + e.message + '\'');
    return null;
  }
}

/**
 * Handles the response from PaymentRequest.show().
 */
async function handleApplePayResponse(response) {
    if (!response) {
      done('Apple Pay returned "undefined" response.');
      return;
    }
    if (!response.complete) {
      done('Apple Pay returned a response without complete() method.');
      return;
    }
    try {
      await response.complete('success')
      done('Apple Pay: This is a demo website. No payment will be processed.');
    } catch (err) {
      error('Apple Pay complete() error: \'' + err.message + '\'');
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
      info(result ? 'SPC: Can make payment.' : 'SPC: Cannot make payment.');
    }).catch((error) => {
      error(`SPC: Error from canMakePayment: ${error.message}`);
    });
    request.hasEnrolledInstrument().then((result) => {
      info(result ? 'SPC: Has enrolled instrument.' : 'SPC: No enrolled instrument.');
    }).catch((error) => {
      error(`SPC: Error from hasEnrolledInstrument: ${error.message}`);
    });
    return request;
  } catch (err) {
    error('SPC error: \'' + err + '\'');
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
    console.log(instrumentResponse);
    info('SPC: payment response: ' + objectToString(instrumentResponse));
  } catch (err) {
    error('SPC error: \'' + err.message + '\'');
  }
}

/**
 * Launches payment request for Apple Pay.
 */
async function onApplePayBuyClicked() {
  if (!window.PaymentRequest || !applePayRequest) {
    error('Apple Pay: PaymentRequest API is not supported.');
    return;
  }

  // Temporary, for testing background tab behavior.
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    const response = await applePayRequest.show();
    await handleApplePayResponse(response);
  } catch (e) {
    error('Apple Pay Error: \'' + e.message + '\'');
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
    alert ('PaymentResponsePolyfill.complete()');
    console.log('PaymentResponsePolyfill.complete()');
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
  constructor(methods, details, options) {}

  show(optionalPromise) {
    console.log('PaymentRequestPolyfill().show()');
    alert('PaymentRequestPolyfill().show()');
    return Promise.resolve(new PaymentResponsePolyfill());
  }

  canMakePayment() {
    console.log('PaymentRequestPolyfill().canMakePayment()');
    return Promise.resolve(true);
  }

  hasEnrolledInstrument() {
    console.log('PaymentRequestPolyfill().hasEnrolledInstrument()');
    return Promise.resolve(true);
  }
}

let ActualPaymentRequest;

function polyfillPaymentRequest() {
  ActualPaymentRequest = window.PaymentRequest;
  window.PaymentRequest = function(methods, details, options) {
    const method = (methods
                    && methods instanceof Array
                    && methods.length > 0
                    && methods[0]
                    && methods[0].supportedMethods)
            ?  methods[0].supportedMethods
            : 'UNKNOWN';
    console.log('new PaymentRequestPolyfill([{supportedMethods: "'+ method +'"}])');
    if (method === 'secure-payment-confirmation') {
      return new PaymentRequestPolyfill(methods, details, options);
    } else {
      return new ActualPaymentRequest(methods, details, options);
    }
  };
}

// main:
polyfillPaymentRequest();
let applePayRequest = buildApplePayPaymentRequest();
let spcRequest = buildSpcPaymentRequest('Credential #1');

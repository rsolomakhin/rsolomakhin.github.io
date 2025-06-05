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

let ActualPaymentRequest;

class PaymentResponsePolyfill {
  constructor() {
    this.details_ = {'hello': 'world'};
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
    return 'methodName';
  }

  get details() {
    return this.details_;
  }
}

function polyfillPaymentRequest() {
  ActualPaymentRequest = window.PaymentRequest;
  window.PaymentRequest = function(methods, details, options) {
    this.isSpc = (methods && methods instanceof Array && methods.length == 1
        && methods[0] && methods[0].supportedMethods
        && methods[0].supportedMethods === 'secure-payment-confirmation');
    this.isApplePay = (methods && methods instanceof Array && methods.length == 1
        && methods[0] && methods[0].supportedMethods
        && methods[0].supportedMethods === 'https://apple.com/apple-pay');
    if (this.isSpc) {
      console.log('new PaymentRequestPolyfill(spc)');
      this.methods = methods;
      this.details = details;
      this.options = options;
    } else if (this.isApplePay) {
      console.log('new PaymentRequestPolyfill(Apple Pay)');
      return new ActualPaymentRequest(methods, details, options);
    } else {
      console.log('new PaymentRequestPolyfill(other)');
    }
  };

  window.PaymentRequest.prototype.show = function(optionalPromise) {
    if (this.isSpc) {
      console.log('PaymentRequestPolyfill(spc).show()');
      alert('PaymentRequestPolyfill(spc).show()');
      return Promise.resolve(new PaymentResponsePolyfill());
    } else if (this.isApplePay) {
      console.log('PaymentRequestPolyfill(Apple Pay).show()');
      return this.fallback.show(optionalPromise);
    } else {
      console.log('PaymentRequestPolyfill(other).show()');
      alert('PaymentRequestPolyfill(other).show()');
      return Promise.resolve(null);
    }
  };

  window.PaymentRequest.prototype.canMakePayment = function() {
    if (this.isSpc) {
      console.log('PaymentRequestPolyfill(spc).canMakePayment()');
      return Promise.resolve(true);
    } else if (this.isApplePay) {
      console.log('PaymentRequestPolyfill(Apple Pay).canMakePayment()');
      return this.fallback.canMakePayment();
    } else {
      console.log('PaymentRequestPolyfill(other).canMakePayment()');
      return Promise.resolve(false);
    }
  };

  window.PaymentRequest.prototype.hasEnrolledInstrument = function() {
    if (this.isSpc) {
      console.log('PaymentRequestPolyfill(spc).hasEnrolledInstrument()');
      return Promise.resolve(true);
    } else if (this.isApplePay) {
      console.log('PaymentRequestPolyfill(Apple Pay).hasEnrolledInstrument() not implemented. Defaulting to `true`.');
      return Promise.resolve(true);
    } else {
      console.log('PaymentRequestPolyfill(other).hasEnrolledInstrument()');
      return Promise.resolve(false);
    }
  };

  window.PaymentRequest.prototype.abort = function() {
    if (this.isSpc) {
      console.log('PaymentRequestPolyfill(spc).abort()');
      return Promise.resolve(true);
    } else if (this.isApplePay) {
      console.log('PaymentRequestPolyfill(Apple Pay).abort()');
      return this.fallback.abort();
    } else {
      console.log('PaymentRequestPolyfill(other).abort()');
      return Promise.resolve(false);
    }
  };

  window.PaymentRequest.prototype.addEventlistener = function(type, listener, options) {
    if (this.isSpc) {
      console.log('PaymentRequestPolyfill(spc).addEventListener(' + type + ')');
    } else if (this.isApplePay) {
      console.log('PaymentRequestPolyfill(Apple Pay).addEventListener(' + type + ')');
      return this.fallback.addEventlistener(type, listener, options);
    } else {
      console.log('PaymentRequestPolyfill(other).addEventListener(' + type + ')');
    }
  };
}

// main:
polyfillPaymentRequest();
let applePayRequest = buildApplePayPaymentRequest();
let spcRequest = buildSpcPaymentRequest('Credential #1');

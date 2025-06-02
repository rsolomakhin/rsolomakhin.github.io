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
      label: 'Donation',
      amount: {
        currency: 'USD',
        value: '55.00',
      },
    },
    displayItems: [{
      label: 'Original donation amount',
      amount: {
        currency: 'USD',
        value: '65.00',
      },
    }, {
      label: 'Friends and family discount',
      amount: {
        currency: 'USD',
        value: '-10.00',
      },
    }],
  };

  let request = null;

  try {
    request = new PaymentRequest(supportedInstruments, details);
    if (request.canMakePayment) {
      request.canMakePayment().then(function(result) {
        info(result ? 'Apple Pay: Can make payment' : 'Apple Pay: Cannot make payment');
      }).catch(function(err) {
        error(err);
      });
    }
  } catch (e) {
    error('Apple Pay: Developer mistake: \'' + e.message + '\'');
  }

  return request;
}

/**
 * Handles the response from PaymentRequest.show().
 */
function handleApplePayResponse(response) {
    if (!response) {
      done('Apple Pay returned "undefined" response.');
      return;
    }
    if (!response.complete) {
      done('Apple Pay returned a response without complete() method.');
      return;
    }
    response.complete('success')
      .then(function() {
        done('Apple Pay: This is a demo website. No payment will be processed.', response);
      })
      .catch(function(err) {
        error(err);
        applePayRequest = buildApplePayPaymentRequest();
      });
}

/**
 * Launches payment request for SPC.
 */
async function onSpcBuyClicked(windowLocalStorageIdentifier) {
  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    const request = await createSPCPaymentRequest({
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

    try {
      const canMakePayment = await request.canMakePayment();
      info(`canMakePayment result: ${canMakePayment}`);
    } catch (err) {
      error(`Error from canMakePayment: ${error.message}`);
    }

    const instrumentResponse = await request.show();
    await instrumentResponse.complete('success')
    console.log(instrumentResponse);
    info(windowLocalStorageIdentifier + ' payment response: ' +
      objectToString(instrumentResponse));
  } catch (err) {
    error(err);
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
  }

  get requestId() {
    return 'requestId';
  }

  get methodName() {
    return 'methodName';
  }

  get details() {
    this.details_;
  }
}

function polyfillPaymentRequest() {
  ActualPaymentRequest = window.PaymentRequest;
  window.PaymentRequest = function(methods, details, options) {
    this.isSpc = (methods && methods instanceof Array && methods.length == 1
        && methods[0] && methods[0].supportedMethods
        && methods[0].supportedMethods === 'secure-payment-confirmation');
    console.log('new PaymentRequestPolyfill()');
    if (this.isSpc) {
      console.log('Is SPC');
      this.methods = methods;
      this.details = details;
      this.options = options;
    } else {
      console.log('Is not SPC');
      this.fallback = new ActualPaymentRequest(methods, details, options);
    }
  };

  window.PaymentRequest.prototype.show = function(optionalPromise) {
    console.log('PaymentRequestPolyfill.show()');
    if (this.isSpc) {
      alert('PaymentRequestPolyfill(spc).show()');
      return new PaymentResponsePolyfill();
    } else {
      this.fallback.show(optionalPromise);
    }
  };

  window.PaymentRequest.prototype.canMakePayment = function() {
    if (this.isSpc) {
      console.log('PaymentRequestPolyfill(spc).canMakePayment()');
      return true;
    } else {
      return this.fallback.canMakePayment();
    }
  };

  window.PaymentRequest.prototype.abort = function() {
    if (this.isSpc) {
      console.log('PaymentRequestPolyfill(spc).abort()');
      return true;
    } else {
      return this.fallback.abort();
    }
  };

  window.PaymentRequest.prototype.addEventlistener = function(type, listener, options) {
    if (this.isSpc) {
      console.log('PaymentRequestPolyfill(spc).addEventListener()');
    } else {
      return this.fallback.addEventlistener(type, listener, options);
    }
  };
}

// main:
polyfillPaymentRequest();
let applePayRequest = buildApplePayPaymentRequest();

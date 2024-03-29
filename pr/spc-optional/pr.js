/* exported createPaymentCredential */
/* exported onBuyClicked */
const textEncoder = new TextEncoder();
/**
 * Converts an ArrayBuffer into a string.
 */
function arrayBufferToString(input) {
  return String.fromCharCode(...new Uint8Array(input));
}
/**
 * Converts an ArrayBuffer into a base64 encoded string.
 */
function arrayBufferToBase64(input) {
  return btoa(arrayBufferToString(input));
}
/**
 * Converts a base64 encoded string into Unit8Array.
 */
function base64ToArray(input) {
  return Uint8Array.from(atob(input), c => c.charCodeAt(0))
}
/**
 * Converts a PaymentResponse or a PublicKeyCredential into an dictionary.
 */
function objectToDictionary(input) {
  let output = {};
  if (input.requestId) {
    output.requestId = input.requestId;
  }
  if (input.id) {
    output.id = input.id;
  }
  if (input.rawId && input.rawId.constructor === ArrayBuffer) {
    output.rawId = arrayBufferToBase64(input.rawId);
  }
  if (input.response && (input.response.constructor ===
      AuthenticatorAttestationResponse || input.response.constructor ===
      AuthenticatorAssertionResponse || input.response.constructor === Object
      )) {
    output.response = objectToDictionary(input.response);
  }
  if (input.attestationObject && input.attestationObject.constructor ===
    ArrayBuffer) {
    output.attestationObject = arrayBufferToBase64(input.attestationObject);
  }
  if (input.authenticatorData && input.authenticatorData.constructor ===
    ArrayBuffer) {
    output.authenticatorData = arrayBufferToBase64(input.authenticatorData);
  }
  if (input.authenticatorData && input.authenticatorData.constructor ===
    String) {
    output.authenticatorData = input.authenticatorData;
  }
  if (input.clientDataJSON && input.clientDataJSON.constructor ===
    ArrayBuffer) {
    output.clientDataJSON = arrayBufferToString(input.clientDataJSON);
  }
  if (input.clientDataJSON && input.clientDataJSON.constructor ===
    String) {
    output.clientDataJSON = atob(input.clientDataJSON);
  }
  if (input.info) {
    output.info = objectToDictionary(input.info);
  }
  if (input.signature && input.signature.constructor === ArrayBuffer) {
    output.signature = arrayBufferToBase64(input.signature);
  }
  if (input.signature && input.signature.constructor === String) {
    output.signature = input.signature;
  }
  if (input.userHandle && input.userHandle.constructor === ArrayBuffer) {
    output.userHandle = arrayBufferToBase64(input.userHandle);
  }
  if (input.userHandle && input.userHandle.constructor === String) {
    output.userHandle = input.userHandle;
  }
  if (input.type) {
    output.type = input.type;
  }
  if (input.methodName) {
    output.methodName = input.methodName;
  }
  if (input.details) {
    output.details = objectToDictionary(input.details);
  }
  if (input.appid_extension) {
    output.appid_extension = input.appid_extension;
  }
  if (input.challenge) {
    output.challenge = input.challenge;
  }
  if (input.echo_appid_extension) {
    output.echo_appid_extension = input.echo_appid_extension;
  }
  if (input.echo_prf) {
    output.echo_prf = input.echo_prf;
  }
  if (input.prf_not_evaluated) {
    output.prf_not_evaluated = input.prf_not_evaluated;
  }
  if (input.prf_results) {
    output.prf_results = objectToDictionary(input.prf_results);
  }
  if (input.user_handle) {
    output.user_handle = input.user_handle;
  }
  if (input.authenticator_data) {
    output.authenticator_data = input.authenticator_data;
  }
  if (input.client_data_json) {
    output.client_data_json = atob(input.client_data_json);
  }
  if (input.shippingAddress) {
    output.shippingAddress = input.shippingAddress;
  }
  if (input.shippingOption) {
    output.shippingOption = input.shippingOption;
  }
  if (input.payerName) {
    output.payerName = input.payerName;
  }
  if (input.payerEmail) {
    output.payerEmail = input.payerEmail;
  }
  if (input.payerPhone) {
    output.payerPhone = input.payerPhone;
  }
  return output;
}
/**
 * Converts a PaymentResponse or a PublicKeyCredential into a string.
 */
function objectToString(input) {
  return JSON.stringify(objectToDictionary(input), undefined, 2);
}

// Return whether or not SPC supports residentKey 'preferred' (instead of just
// 'required'). There is unfortunately no way to feature detect this, so we
// have to do a version check.
function spcSupportsPreferred() {
  // This will be true for not just Chrome but also Edge/etc, but that's fine.
  const match = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
  if (!match)
    return false;

  const version = parseInt(match[2], 10);
  // https://crrev.com/130fada41 landed in 106.0.5228.0, but we assume that any
  // 106 will do for simplicity.
  return version >= 106;
}

async function createCredentialCompat() {
  const rp = {
    id: window.location.hostname,
    name: 'Rouslan Solomakhin',
  };
  const pubKeyCredParams = [{
    type: 'public-key',
    alg: -7, // ECDSA, not supported on Windows.
  }, {
    type: 'public-key',
    alg: -257, // RSA, supported on Windows.
  }];
  const challenge = textEncoder.encode('Enrollment challenge');
  if (window.PaymentCredential) {
    const payment = {
      rp,
      instrument: {
        displayName: 'Troy ····',
        icon: 'https://rsolomakhin.github.io/pr/spc/troy.png',
      },
      challenge,
      pubKeyCredParams,
      authenticatorSelection: {
        userVerification: 'required',
      },
    };
    return await navigator.credentials.create({
      payment
    });
  } else {
    const publicKey = {
      rp,
      user: {
        name: 'user@domain',
        id: Uint8Array.from(String(Math.random()*999999999), c => c.charCodeAt(0)),
        displayName: 'User',
      },
      challenge,
      pubKeyCredParams,
      authenticatorSelection: {
        userVerification: 'required',
        residentKey: spcSupportsPreferred() ? 'preferred' : 'required',
        authenticatorAttachment: 'platform',
      },
      extensions: {
        payment: {
          isPayment: true,
        },
      }
    };
    return await navigator.credentials.create({
      publicKey
    });
  }
}

/**
 * Creates a payment credential.
 */
async function createPaymentCredential(windowLocalStorageItemKey) {
  try {
    const publicKeyCredential = await createCredentialCompat();
    console.log(publicKeyCredential);
    window.localStorage.setItem(windowLocalStorageItemKey,
      arrayBufferToBase64(publicKeyCredential.rawId));
    info(windowLocalStorageItemKey + ' enrolled: ' + objectToString(
      publicKeyCredential));
  } catch (err) {
    error(err);
  }
}
/**
 * Initializes the payment request object.
 * @return {PaymentRequest} The payment request object.
 */
async function buildPaymentRequest(autofillField, windowLocalStorageItemKey) {
  console.log("Autofill field is", autofillField);
  if (!window.PaymentRequest) {
    return null;
  }
  let request = null;
  try {
    const challenge = textEncoder.encode('network_data');
    const updatedInstrument = {
      displayName: 'My Troy Card',
      icon: 'https://rsolomakhin.github.io/pr/spc/troy-alt-logo.png',
    };
    const supportedInstruments = [{
      supportedMethods: 'secure-payment-confirmation',
      data: {
        credentialIds: [base64ToArray(window.localStorage.getItem(
          windowLocalStorageItemKey))],
        instrument: updatedInstrument,
        networkData: challenge,
        challenge,
        timeout: 60000,
        payeeOrigin: window.location.origin,
        rpId: window.location.hostname,
        autofillField,
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
  } catch (err) {
    error(err);
  }
  return request;
}
/**
 * Launches payment request for Android Pay.
 */
async function optionallyGetSpcFrom(autofillField, windowLocalStorageItemKey) {
  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }
  if (!window.PaymentRequest.prototype.showInAutofillField) {
    error('Secure Payment Confirmation is not supported in autofill popups.');
    return;
  }
  const request = await buildPaymentRequest(
      autofillField, windowLocalStorageItemKey);
  if (!request) return;
  try {
    const instrumentResponse = await request.showInAutofillField();
    await instrumentResponse.complete('success')
    console.log(instrumentResponse);
    info(windowLocalStorageItemKey + ' payment response: ' +
      objectToString(instrumentResponse));
  } catch (err) {
    error(err);
  }
}

function pretendSubmitForm() {
  const phoneNumber = document.getElementById('phone-field').value;
  if (phoneNumber) {
    info('Valid SMS code received.');
  } else {
    error('No SMS code provided.');
  }
}

function init() {
  const verifyForm = document.getElementById('verify-form');
  verifyForm.addEventListener('submit', evt => {
    evt.preventDefault();
    pretendSubmitForm();
  });
}

init();

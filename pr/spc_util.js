/**
 * Creates a demo WebAuthn credential, optionally setting the 'payment'
 * extension. The created credential will always have the name 'Troy ····
 * 1234', matching the demo payment instrument used in authentication.
 *
 * @param {boolean} setPaymentExtension - whether or not to enable the 'payment'
 *     extension in the created credential.
 * @param {object} optionalOverrides - a set of optional overrides for the
 *     default credential creation parameters.
 * @return {PublicKeyCredential} the created credential.
 */
async function createCredential(setPaymentExtension, optionalOverrides = {}) {
  const {userIdOverride, residentKeyOverride, additionalExtensions} =
      optionalOverrides;
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
  const userId = (userIdOverride !== undefined) ? userIdOverride : String(Math.random()*999999999);
  const user = {
    // Set an understandable 'username' in case the WebAuthn UX displays it
    // (e.g., the Passkeys UX on Chrome MacOS 108+). This is for display ONLY,
    // and has no bearing on SPC's functionality in general. (For example, it
    // is NOT shown in the SPC transaction dialog.)
    name: 'Troy ···· 1234',
    displayName: '',
    id: Uint8Array.from(userId, c => c.charCodeAt(0)),
  }

  let residentKey = spcSupportsPreferred() ? 'preferred' : 'required';
  if (residentKeyOverride !== undefined)
    residentKey = residentKeyOverride;

  const publicKey = {
    rp,
    user,
    challenge: new TextEncoder().encode('Enrollment challenge'),
    pubKeyCredParams,
    authenticatorSelection: {
      userVerification: 'required',
      residentKey,
      authenticatorAttachment: 'platform',
    },
  };

  if (setPaymentExtension || additionalExtensions !== undefined) {
    publicKey['extensions'] = additionalExtensions !== undefined
        ? additionalExtensions
        : {};
    if (setPaymentExtension) {
      publicKey['extensions']['payment'] = {
        isPayment: true,
      };
    }
  }

  return await navigator.credentials.create({publicKey});
}

/**
 * Returns whether or not SPC supports residentKey 'preferred' (instead of just
 * 'required'). There is unfortunately no way to feature detect this, so we
 * have to do a version check.
 *
 * @return {boolean} true if SPC supports 'preferred' for the residentKey
 *     parameter, false otherwise.
 */
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

/**
 * Creates a PaymentRequest object for SPC.
 *
 * @param {SecurePaymentConfirmationRequest} spcData - the input SPC data. The
 *     credentialIds field *MUST* be set. Any other SecurePaymentConfirmationRequest
 *     fields not set in this object will be initialized to a default value.
 * @return {PaymentRequest} The payment request object.
 */
function createSPCPaymentRequest(spcData) {
  if (!window.PaymentRequest) {
    throw new Error('PaymentRequest API is not supported.');
  }
  if (spcData === undefined || spcData.credentialIds === undefined) {
    throw new Error('credentialIds must be set in the input spcData object.');
  }

  // https://w3c.github.io/secure-payment-confirmation/#sctn-securepaymentconfirmationrequest-dictionary
  if (spcData.challenge === undefined)
    spcData.challenge = new TextEncoder().encode('network_data');
  if (spcData.rpId === undefined)
    spcData.rpId = window.location.hostname;
  if (spcData.instrument === undefined)
    spcData.instrument = {};
  if (spcData.instrument.displayName === undefined)
    spcData.instrument.displayName = 'Troy ···· 1234';
  if (spcData.instrument.icon === undefined)
    spcData.instrument.icon = 'https://rsolomakhin.github.io/pr/spc/troy-alt-logo.png';
  if (spcData.timeout === undefined)
    spcData.timeout = 60000;
  // We only set a default payeeOrigin if *both* payeeName and payeeOrigin are
  // not set, as the spec deliberately allows either/or to be null.
  if (!('payeeName' in spcData) && !('payeeOrigin' in spcData))
    spcData.payeeOrigin = window.location.origin;

  const supportedInstruments = [{supportedMethods: 'secure-payment-confirmation', data: spcData}];
  const details = {
    total: {
      label: 'Total',
      amount: {
        currency: 'USD',
        value: '0.01',
      },
    },
  };

  return new PaymentRequest(supportedInstruments, details); 
}

/**
 * Converts a PaymentResponse or a PublicKeyCredential into a string.
 */
function objectToString(input) {
  return JSON.stringify(objectToDictionary(input), undefined, 2);
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
 * Converts a base64 encoded string into Unit8Array.
 */
function base64ToArray(input) {
  return Uint8Array.from(atob(input), c => c.charCodeAt(0))
}

/**
 * Converts an ArrayBuffer into a base64 encoded string.
 */
function arrayBufferToBase64(input) {
  return btoa(arrayBufferToString(input));
}

/**
 * Converts an ArrayBuffer into a string.
 */
function arrayBufferToString(input) {
  return String.fromCharCode(...new Uint8Array(input));
}

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
  const {userIdOverride, residentKeyOverride} = optionalOverrides;
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

  if (setPaymentExtension)
    publicKey['extensions'] = {payment: {isPayment: true}};

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

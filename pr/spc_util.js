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

/**
 * Creates a demo WebAuthn credential, optionally setting the 'payment'
 * extension. The created credential will always have the name 'Troy ····
 * 1234', matching the demo payment instrument used in authentication.
 *
 * @param {boolean} setPaymentExtension - whether or not to enable the 'payment'
 *     extension in the created credential.
 * @return {PublicKeyCredential} the created credential.
 */
async function createCredential(setPaymentExtension) {
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
  const user = {
    name: 'Troy ···· 1234',
    displayName: '',
    id: Uint8Array.from(String(Math.random()*999999999), c => c.charCodeAt(0)),
  }
  const publicKey = {
    rp,
    user,
    challenge: new TextEncoder().encode('Enrollment challenge'),
    pubKeyCredParams,
    authenticatorSelection: {
      userVerification: 'required',
      residentKey: spcSupportsPreferred() ? 'preferred' : 'required',
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

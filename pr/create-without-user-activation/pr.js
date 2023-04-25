/* exported createPaymentCredential */
/* exported onBuyClicked */

async function createCredentialInner(residentKey, requireResidentKey) {
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
  const userId = String(Math.random()*999999999);
  const user = {
    // Set an understandable 'username' in case the WebAuthn UX displays it
    // (e.g., the Passkeys UX on Chrome MacOS 108+). This is for display ONLY,
    // and has no bearing on SPC's functionality in general. (For example, it
    // is NOT shown in the SPC transaction dialog.)
    name: 'Troy ···· 1234',
    displayName: '',
    id: Uint8Array.from(userId, c => c.charCodeAt(0)),
  }

  const publicKey = {
    rp,
    user,
    challenge: new TextEncoder().encode('Enrollment challenge'),
    pubKeyCredParams,
    authenticatorSelection: {
      userVerification: 'required',
      authenticatorAttachment: 'platform',
    },
  };

  if (residentKey !== undefined) {
    info(`Setting residentKey parameter to ${residentKey}`);
    publicKey.authenticatorSelection['residentKey'] = residentKey;
  }

  if (requireResidentKey !== undefined) {
    info(`Setting requireResidentKey parameter to ${requireResidentKey}`);
    publicKey.authenticatorSelection['requireResidentKey'] = requireResidentKey;
  } 

  return await navigator.credentials.create({publicKey});
}

/**
 * Creates a payment credential.
 */
async function createPaymentCredential(windowLocalStorageIdentifier, residentKey, requireResidentKey) {
  try {
    const publicKeyCredential = await createCredentialInner(residentKey, requireResidentKey);
    console.log(publicKeyCredential);
    window.localStorage.setItem(windowLocalStorageIdentifier,
      arrayBufferToBase64(publicKeyCredential.rawId));
    info(windowLocalStorageIdentifier + ' enrolled: ' + objectToString(
      publicKeyCredential));
  } catch (err) {
    error(err);
  }
}

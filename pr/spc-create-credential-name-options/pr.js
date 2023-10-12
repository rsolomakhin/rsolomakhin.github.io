/* exported createPaymentCredential */

async function createCredentialInner(name, displayName) {
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
    name: name,
    displayName: displayName,
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
      residentKey: 'required',
    },
    extensions: {
      payment: {isPayment: true},
    },
  };

  return await navigator.credentials.create({publicKey});
}

/**
 * Creates a payment credential.
 */
async function createPaymentCredential(windowLocalStorageIdentifier, name, displayName) {
  try {
    const publicKeyCredential = await createCredentialInner(name, displayName);
    console.log(publicKeyCredential);
    window.localStorage.setItem(windowLocalStorageIdentifier,
      arrayBufferToBase64(publicKeyCredential.rawId));
    info(windowLocalStorageIdentifier + ' enrolled: ' + objectToString(
      publicKeyCredential));
  } catch (err) {
    error(err);
  }
}

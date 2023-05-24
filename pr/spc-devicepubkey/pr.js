/* exported createPaymentCredential */
/* exported onBuyClicked */

const windowLocalStorageIdentifier = 'spc-devicepubkey';

/**
 * Creates a payment credential.
 */
async function createPaymentCredential(devicePubKey = false) {
  try {
    const publicKeyCredential = await createCredential(
        /*setPaymentExtension=*/ true, /*optionalOverrides=*/ {
          additionalExtensions: buildExtensions(devicePubKey),
        });
    console.log(publicKeyCredential);
    window.localStorage.setItem(windowLocalStorageIdentifier,
      arrayBufferToBase64(publicKeyCredential.rawId));
    info(
        'Enrolled: ' + objectToString(publicKeyCredential) + '\n' +
        'Extensions: ' + extensionsOutputToString(publicKeyCredential));
  } catch (err) {
    error(err);
  }
}

/**
 * Launches payment request for SPC.
 */
async function onBuyClicked(getDevicePubKey = false) {
  try {
    const request = await createSPCPaymentRequest(
        {
          credentialIds: [base64ToArray(
              window.localStorage.getItem(windowLocalStorageIdentifier))],
          extensions: buildExtensions(getDevicePubKey),
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
    info(
        'Payment response: ' + objectToString(instrumentResponse) + '\n' +
        'Extensions: ' + extensionsOutputToString(instrumentResponse.details));
  } catch (err) {
    error(err);
  }
}

async function webAuthnGet(getDevicePubKey) {
  try {
    const publicKey = {
      challenge: new TextEncoder().encode('Authentication challenge'),
      userVerification: 'required',
      allowCredentials: [{
        transports: ['internal'],
        type: 'public-key',
        id: base64ToArray(window.localStorage.getItem(
          windowLocalStorageIdentifier)),
      }, ],
      extensions: buildExtensions(getDevicePubKey),
    };
    const credentialInfoAssertion = await navigator.credentials.get({
      publicKey
    });
    console.log(credentialInfoAssertion);
    info(
        'Successful login: ' + objectToString(credentialInfoAssertion) + '\n' +
        'Extensions: ' + extensionsOutputToString(credentialInfoAssertion));
  } catch (err) {
    error(err);
  }
}

function buildExtensions(getDevicePubKey) {
  if (getDevicePubKey) {
    return {
      devicePubKey: {},
    };
  } else {
    return {};
  }
}

function extensionsOutputToString(credentialInfoAssertion) {
  const clientExtensionResults =
      credentialInfoAssertion.getClientExtensionResults();
  const devicePubKey = clientExtensionResults.devicePubKey;
  if (devicePubKey !== undefined) {
    devicePubKey.authenticatorOutput =
        arrayBufferToBase64(devicePubKey.authenticatorOutput);
    devicePubKey.signature = arrayBufferToBase64(devicePubKey.signature);
  }
  return JSON.stringify(
      clientExtensionResults, /*replacer=*/ undefined,
      /*space=*/ 2);
}

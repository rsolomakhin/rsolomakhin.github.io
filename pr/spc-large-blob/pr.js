/* exported createPaymentCredential */
/* exported onBuyClicked */

/**
 * Creates a payment credential.
 */
async function createPaymentCredential(
    windowLocalStorageIdentifier,
    requireLargeBlobSupport = false,
) {
  try {
    const publicKeyCredential = await createCredential(
        /*setPaymentExtension=*/ true, /*optionalOverrides=*/ {
          additionalExtensions: buildEnrollExtensions(requireLargeBlobSupport),
        });
    console.log(publicKeyCredential);
    window.localStorage.setItem(
        windowLocalStorageIdentifier,
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
async function onBuyClicked(
    windowLocalStorageIdentifier, largeBlobMode = LargeBlobMode.None) {
  try {
    const request = await createSPCPaymentRequest({
      credentialIds: [base64ToArray(
          window.localStorage.getItem(windowLocalStorageIdentifier))],
      extensions: buildLoginExtensions(
          largeBlobMode, /* textToWrite= */ 'SecurePaymentConfirmation'),
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

async function webAuthnGet(windowLocalStorageIdentifier, largeBlobMode) {
  try {
    const publicKey = {
      challenge: new TextEncoder().encode('Authentication challenge'),
      userVerification: 'required',
      allowCredentials: [
        {
          transports: ['internal'],
          type: 'public-key',
          id: base64ToArray(
              window.localStorage.getItem(windowLocalStorageIdentifier)),
        },
      ],
      extensions: buildLoginExtensions(largeBlobMode),
    };
    const credentialInfoAssertion =
        await navigator.credentials.get({publicKey});
    console.log(credentialInfoAssertion);
    info(
        'Login: ' + objectToString(credentialInfoAssertion) + '\n' +
        'Extensions: ' + extensionsOutputToString(credentialInfoAssertion));
  } catch (err) {
    error(err);
  }
}

const LargeBlobMode = {
  None: 'None',
  Read: 'Read',
  Write: 'Write',
};

function buildEnrollExtensions(requireLargeBlobSupport) {
  if (requireLargeBlobSupport) {
    return {
      largeBlob: {
        support: 'required',
      }
    };
  } else {
    return {};
  }
}

function buildLoginExtensions(mode, textToWrite = 'WebAuthn') {
  if (mode === LargeBlobMode.None) {
    return {};
  } else if (mode === LargeBlobMode.Write) {
    buffer = new TextEncoder().encode(textToWrite);
    return {
      largeBlob: {
        write: buffer,
      },
    };
  } else if (mode === LargeBlobMode.Read) {
    return {
      largeBlob: {
        read: true,
      }
    };
  }
}

function extensionsOutputToString(credentialInfoAssertion) {
  const clientExtensionResults =
      credentialInfoAssertion.getClientExtensionResults();
  if (clientExtensionResults.largeBlob !== undefined &&
      clientExtensionResults.largeBlob.blob !== undefined) {
    clientExtensionResults.largeBlob.blob =
        arrayBufferToString(clientExtensionResults.largeBlob.blob);
  }
  return JSON.stringify(
      clientExtensionResults, /*replacer=*/ undefined,
      /*space=*/ 2);
}

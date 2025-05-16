/* exported createPaymentCredential */
/* exported onBuyClicked */

/**
 * Creates a payment credential.
 */
async function createPaymentCredential(windowLocalStorageIdentifier) {
  try {
    const publicKeyCredential = await createCredential(/*setPaymentExtension=*/true);
    console.log(publicKeyCredential);
    window.localStorage.setItem(windowLocalStorageIdentifier,
      arrayBufferToBase64(publicKeyCredential.rawId));
    reloadIdentifierInInputs();
    info(windowLocalStorageIdentifier + ' enrolled: ' + objectToString(
      publicKeyCredential) + '\n' + 'Extensions: ' +
      extensionsOutputToString(publicKeyCredential));
  } catch (err) {
    error(err);
  }
}

/**
 * Sets the payment credential id in localStorage. A
 * data-local-storage-identifier attribute must be set on the element.
 */
function onCredentialIdChange(inputElement) {
  let windowLocalStorageIdentifier = inputElement.getAttribute('data-local-storage-identifier');
  if (!windowLocalStorageIdentifier) {
    console.log("The input element is missing a data-local-storage-identifier attribute.");
    return;
  }
  window.localStorage.setItem(windowLocalStorageIdentifier, inputElement.value);
}

/**
 * Reloads the identifiers from localStorage into the input fields.
 */
function reloadIdentifierInInputs() {
  let inputElements = document.querySelectorAll('input[data-local-storage-identifier]');
  for (let inputElement of inputElements) {
    let windowLocalStorageIdentifier = inputElement.getAttribute('data-local-storage-identifier');
    inputElement.value = window.localStorage.getItem(windowLocalStorageIdentifier);
  }
}

/**
 * Launches payment request for SPC.
 */
async function onBuyClicked(windowLocalStorageIdentifier) {
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
      objectToString(instrumentResponse) + '\n' + 'Extensions: ' +
      extensionsOutputToString(instrumentResponse.details));
  } catch (err) {
    error(err);
  }
}

async function webAuthnGet(windowLocalStorageIdentifier) {
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
    };
    const credentialInfoAssertion = await navigator.credentials.get({
      publicKey
    });
    console.log(credentialInfoAssertion);
    info('Successful login with ' + windowLocalStorageIdentifier + ': ' +
      objectToString(credentialInfoAssertion));
  } catch (err) {
    error(err);
  }
}

function extensionsOutputToString(credentialInfoAssertion) {
  const clientExtensionResults =
      credentialInfoAssertion.getClientExtensionResults();
  if (clientExtensionResults.payment !== undefined &&
      clientExtensionResults.payment.browserBoundSignature !== undefined) {
      var browserBoundSignature = clientExtensionResults.payment.browserBoundSignature;
      browserBoundSignature.signature =
          arrayBufferToBase64(browserBoundSignature.signature);
  }
  return JSON.stringify(clientExtensionResults, /*replacer=*/ undefined, /*space=*/ 2);
}

if (PublicKeyCredential) {
  if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      .then((available) => {
        info(`isUserVerifyingPlatformAuthenticatorAvailable: ${available}`);
      }).catch((error) => {
        error(`Error when calling isUserVerifyingPlatformAuthenticatorAvailable: ${error.message}`);
      });
  } else {
    error('PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable method not detected');
  }
} else {
  error('PublicKeyCredential interface not detected');
}

if (PaymentRequest && PaymentRequest.securePaymentConfirmationAvailability) {
  PaymentRequest.securePaymentConfirmationAvailability()
    .then((available) => {
      info(`PaymentRequest.securePaymentConfirmationAvailability: ${available}`);
    }).catch((error) => {
      error(`Error when calling PaymentRequest.securePaymentConfirmationAvailability: ${error.message}`);
    });
} else {
  info('PaymentRequest.securePaymentConfirmationAvailability method not available');
}

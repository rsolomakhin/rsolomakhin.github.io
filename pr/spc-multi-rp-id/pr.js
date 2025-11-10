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
    info(windowLocalStorageIdentifier + ' enrolled: ' + objectToString(
      publicKeyCredential) + '\n' + 'Extensions: ' +
      extensionsOutputToString(publicKeyCredential) + '\n\n' +
      'RP ID: ' + window.location.hostname + '\n' +
      'Credential ID (Base64): ' + arrayBufferToBase64(publicKeyCredential.rawId));
  } catch (err) {
    error(err);
  }
}

/**
 * Launches payment request for SPC.
 */
async function onBuyClicked() {
  const credentialIds = [];

  const rpId1 = document.getElementById('rp_id_1').value;
  const credId1 = document.getElementById('credential_id_1').value;
  if (rpId1 && credId1) {
    try {
      credentialIds.push({
        rpId: rpId1,
        credentialId: base64ToArray(credId1),
      });
    } catch (e) {
      error('Invalid Base64 for Credential ID 1: ' + e.message);
      return;
    }
  }

  const rpId2 = document.getElementById('rp_id_2').value;
  const credId2 = document.getElementById('credential_id_2').value;
  if (rpId2 && credId2) {
    try {
      credentialIds.push({
        rpId: rpId2,
        credentialId: base64ToArray(credId2),
      });
    } catch (e) {
      error('Invalid Base64 for Credential ID 2: ' + e.message);
      return;
    }
  }

  if (credentialIds.length === 0) {
    error('Please enter at least one RP ID and Credential ID.');
    return;
  }

  try {
    const request = await createSPCPaymentRequest({
      credentialIds: credentialIds,
      paymentEntitiesLogos: [
        {url: 'https://rsolomakhin.github.io/static/sync-network-logo.png', label: 'Sync Network'},
        {url: 'https://rsolomakhin.github.io/static/troy-alt-logo.png', label: 'TroyBank'},
      ],
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
    info('Payment response: ' +
      objectToString(instrumentResponse) + '\n' + 'Extensions: ' +
      extensionsOutputToString(instrumentResponse.details));
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

/* exported createPaymentCredential */
/* exported onBuyClicked */

const kValidLogoUrl = 'https://rsolomakhin.github.io/static/sync-network-logo.png';

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
      publicKeyCredential));
  } catch (err) {
    error(err);
  }
}

/**
 * Launches payment request for SPC.
 */
async function onBuyClicked(windowLocalStorageIdentifier, logosList) {
  try {
    let params = {
      credentialIds: [base64ToArray(window.localStorage.getItem(windowLocalStorageIdentifier))],
      instrument: {
        displayName: '···· 1234',
        icon: 'https://rsolomakhin.github.io/static/troy-card-art.png',
      },
    };

    params.paymentEntitiesLogos = [];
    for (const logoId of logosList) {
      if (logoId === 'null-logo') {
        params.paymentEntitiesLogos.push(null);
      } else if (logoId === 'logo-missing-url') {
        const label = 'Label';
        params.paymentEntitiesLogos.push({label});
      } else if (logoId === 'logo-empty-url') {
        const url = '';
        const label = 'Label';
        params.paymentEntitiesLogos.push({url, label});
      } else if (logoId === 'logo-invalid-url') {
        const url = 'this-is-not-a-valid-url';
        const label = 'Label';
        params.paymentEntitiesLogos.push({url, label});
      } else if (logoId === 'logo-missing-label') {
        const url = kValidLogoUrl;
        params.paymentEntitiesLogos.push({url});
      } else if (logoId === 'logo-empty-label') {
        const url = kValidLogoUrl;
        const label = '';
        params.paymentEntitiesLogos.push({url});
      } else {
        const url = document.getElementById(`${logoId}-url`).value;
        const label = document.getElementById(`${logoId}-label`).value;
        params.paymentEntitiesLogos.push({url, label});
      }
    }

    const request = await createSPCPaymentRequest(params);
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
      objectToString(instrumentResponse));
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

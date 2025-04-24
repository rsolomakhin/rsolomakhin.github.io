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
      publicKeyCredential));
  } catch (err) {
    error(err);
  }
}

const NetworkOrIssuerOptions = {
  DoNotShow: Symbol('DoNotShow'),
  Show: Symbol('Show'),
  MissingNameField: Symbol('MissingNameField'),
  EmptyName: Symbol('EmptyName'),
  MissingIconField: Symbol('MissingIconField'),
  EmptyIcon: Symbol('EmptyIcon'),
  InvalidIconUrl: Symbol('InvalidIconUrl'),
  NonExistentIconUrl: Symbol('NonExistentIconUrl'),
};

/**
 * Launches payment request for SPC.
 */
async function onBuyClicked(windowLocalStorageIdentifier, showNetworkOption, showIssuerOption) {
  try {
    let params = {
      credentialIds: [base64ToArray(window.localStorage.getItem(windowLocalStorageIdentifier))],
      instrument: {
        displayName: '···· 1234',
        icon: 'https://rsolomakhin.github.io/static/troy-card-art.png',
      },
    };
    if (showNetworkOption != NetworkOrIssuerOptions.DoNotShow) {
      params.networkInfo = {};
      if (showNetworkOption != NetworkOrIssuerOptions.MissingNameField) {
        params.networkInfo.name = (showNetworkOption == NetworkOrIssuerOptions.EmptyName) ? '' : 'Sync';
      }
      if (showNetworkOption != NetworkOrIssuerOptions.MissingIconField) {
        let icon = document.getElementById('network-icon-url').value;
        if (showNetworkOption == NetworkOrIssuerOptions.EmptyIcon) {
          icon = '';
        } else if (showNetworkOption == NetworkOrIssuerOptions.InvalidIconUrl) {
          icon = 'thisisnotaurl';
        } else if (showNetworkOption == NetworkOrIssuerOptions.NonExistentIconUrl) {
          icon = 'https://rsolomakhin.github.io/pr/spc-network-and-issuer-icons/nonexistent.png';
        }
        params.networkInfo.icon = icon;
      }
    }
    if (showIssuerOption != NetworkOrIssuerOptions.DoNotShow) {
      params.issuerInfo = {};
      if (showIssuerOption != NetworkOrIssuerOptions.MissingNameField) {
        params.issuerInfo.name = (showIssuerOption == NetworkOrIssuerOptions.EmptyName) ? '' : 'TroyBank';
      }
      if (showIssuerOption != NetworkOrIssuerOptions.MissingIconField) {
        let icon = document.getElementById('issuer-icon-url').value;
        if (showIssuerOption == NetworkOrIssuerOptions.EmptyIcon) {
          icon = '';
        } else if (showIssuerOption == NetworkOrIssuerOptions.InvalidIconUrl) {
          icon = 'thisisnotaurl';
        } else if (showIssuerOption == NetworkOrIssuerOptions.NonExistentIconUrl) {
          icon = 'https://rsolomakhin.github.io/pr/spc-issuer-and-issuer-icons/nonexistent.png';
        }
        params.issuerInfo.icon = icon;
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

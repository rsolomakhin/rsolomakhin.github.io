/* exported createPaymentCredential */
/* exported pretendSubmitForm */
/* exported optionallyGetSpcFrom */

async function createCredentialCompat() {
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
  const challenge = textEncoder.encode('Enrollment challenge');
  if (window.PaymentCredential) {
    const payment = {
      rp,
      instrument: {
        displayName: 'Troy ····',
        icon: 'https://rsolomakhin.github.io/pr/spc/troy.png',
      },
      challenge,
      pubKeyCredParams,
      authenticatorSelection: {
        userVerification: 'required',
      },
    };
    return await navigator.credentials.create({
      payment
    });
  } else {
    const publicKey = {
      rp,
      user: {
        name: 'Troy ····',
        id: Uint8Array.from(String(Math.random()*999999999), c => c.charCodeAt(0)),
        displayName: '',
      },
      challenge,
      pubKeyCredParams,
      authenticatorSelection: {
        userVerification: 'required',
        residentKey: spcSupportsPreferred() ? 'preferred' : 'required',
        authenticatorAttachment: 'platform',
      },
      extensions: {
        payment: {
          isPayment: true,
        },
      }
    };
    return await navigator.credentials.create({
      publicKey
    });
  }
}

/**
 * Creates a payment credential.
 */
async function createPaymentCredential(windowLocalStorageItemKey) {
  try {
    const publicKeyCredential = await createCredentialCompat();
    console.log(publicKeyCredential);
    window.localStorage.setItem(windowLocalStorageItemKey,
      arrayBufferToBase64(publicKeyCredential.rawId));
    info(windowLocalStorageItemKey + ' enrolled: ' + objectToString(
      publicKeyCredential));
  } catch (err) {
    error(err);
  }
}

/**
 * Initializes the payment request object.
 * @param {string} autofillField - The name of the autofill field
 * @param {string} windowLocalStorageItemKey - The key in window local
 * storage for looking up the previously saved credential identifier.
 * @return {PaymentRequest} The payment request object.
 */
async function buildPaymentRequest(autofillField, windowLocalStorageItemKey) {
  if (!window.PaymentRequest) {
    return null;
  }
  let request = null;
  try {
    const challenge = textEncoder.encode('network_data');
    const updatedInstrument = {
      displayName: 'Troy ····',
      icon: 'https://rsolomakhin.github.io/pr/spc/troy.png',
    };
    const supportedInstruments = [{
      supportedMethods: 'secure-payment-confirmation',
      data: {
        credentialIds: [base64ToArray(window.localStorage.getItem(
          windowLocalStorageItemKey))],
        instrument: updatedInstrument,
        networkData: challenge,
        challenge,
        timeout: 60000,
        payeeOrigin: window.location.origin,
        rpId: window.location.hostname,
        autofillField
      },
    }];
    const details = {
      total: {
        label: 'Total',
        amount: {
          currency: 'USD',
          value: '0.01',
        },
      },
    };
    request = new PaymentRequest(supportedInstruments, details);
  } catch (err) {
    error(err);
  }
  return request;
}

async function optionallyGetSpcFrom(autofillField, windowLocalStorageItemKey) {
  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }
  if (!window.PaymentRequest.AutofillField) {
    error('Showing SPC in Autofill popup is not supported.');
    return;
  }
  const request = await buildPaymentRequest(autofillField, windowLocalStorageItemKey);
  if (!request) return;
  try {
    const instrumentResponse = await request.show();
    await instrumentResponse.complete('success');
    info(windowLocalStorageItemKey + ' payment response: ' +
      objectToString(instrumentResponse));
  } catch (err) {
    error(err);
  }
}

function pretendSubmitForm() {
  if (document.getElementById('phone-field').nodeValue) {
    info('Pretend SMS sent to the provided phone number.');
  } else {
    error('No phone number provided.');
  }
}

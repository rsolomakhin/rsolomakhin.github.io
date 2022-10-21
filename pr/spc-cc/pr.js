/* exported createPaymentCredential */
/* exported onBuyClicked */
const textEncoder = new TextEncoder();

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
        icon: 'https://rsolomakhin.github.io/pr/spc/troy.png',
        name: 'Troy ····',
        displayName: 'Troy ····',
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
        id: Uint8Array.from(String(Math.random()*999999999), c => c.charCodeAt(0)),
        name: 'Troy ····',
        displayName: 'Troy ····',
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
        autofillField,
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
/**
 * Launches payment request for Android Pay.
 */
async function optionallyGetSpcFrom(autofillField, windowLocalStorageItemKey) {
  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }
  if (!window.PaymentRequest.prototype.showInAutofillField) {
    error('Secure Payment Confirmation is not supported in autofill popups.');
    return;
  }
  const request = await buildPaymentRequest(
      autofillField, windowLocalStorageItemKey);
  if (!request) return;
  try {
    const instrumentResponse = await request.showInAutofillField();
    await instrumentResponse.complete('success')
    console.log(instrumentResponse);
    info(windowLocalStorageItemKey + ' payment response: ' +
      objectToString(instrumentResponse));
  } catch (err) {
    error(err);
  }
}

function pretendSubmitForm() {
  const ccNumberField = document.getElementById('cc-number-field');
  const ccNameField = document.getElementById('cc-name-field');
  const ccExpField = document.getElementById('cc-exp-field');
  const ccCscField = document.getElementById('cc-csc-field');
  if (ccNumberField.value
      && ccNameField.value
      && ccExpField.value
      && ccCscField.value) {
    info('Pretend submit CC.');
    ccNumberField.value = '';
    ccNameField.value = '';
    ccExpField.value = '';
    ccCscField.value = '';
  } else {
    error('All fields required.');
  }
}

function init() {
  const cardForm = document.getElementById('card-form');
  cardForm.addEventListener('submit', evt => {
    evt.preventDefault();
    pretendSubmitForm();
  });
}

init();

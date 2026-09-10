/* exported createPaymentCredential */
/* exported onCanMakePaymentClicked */
/* exported onShowClicked */

const windowLocalStorageIdentifier = 'Credential #1';

/**
 * Parses a JSON string input into an array of locale language tags,
 * or returns undefined if no input is provided.
 * @param {string} rawInput - The raw input string.
 * @return {string[]|undefined} Parsed JSON value, or undefined if empty.
 */
function parseLocales(rawInput) {
  if (!rawInput || !rawInput.trim()) {
    return undefined;
  }
  return JSON.parse(rawInput);
}

/**
 * Builds a PaymentRequest object for SPC with locales parsed from the input field.
 * @return {PaymentRequest} The initialized PaymentRequest object.
 */
function buildSPCPaymentRequest() {
  const credentialIdBase64 = window.localStorage.getItem(windowLocalStorageIdentifier);
  const credentialIds = credentialIdBase64 ?
      [base64ToArray(credentialIdBase64)] :
      [new Uint8Array(16)];

  const spcData = {
    credentialIds,
  };

  const locales = parseLocales(document.getElementById('locales').value);
  if (locales !== undefined) {
    spcData.locale = locales;
  }

  info('Locales parameter: ' + (spcData.locale !== undefined ? JSON.stringify(spcData.locale) : 'not set'));
  return createSPCPaymentRequest(spcData);
}

/**
 * Creates a payment credential.
 */
async function createPaymentCredential() {
  try {
    const publicKeyCredential = await createCredential(/* setPaymentExtension = */ true);
    console.log(publicKeyCredential);
    window.localStorage.setItem(
        windowLocalStorageIdentifier,
        arrayBufferToBase64(publicKeyCredential.rawId));
    info(
        windowLocalStorageIdentifier + ' enrolled: ' +
        objectToString(publicKeyCredential));
  } catch (err) {
    error(windowLocalStorageIdentifier + ' enrollment error: ' + err);
  }
}

/**
 * Calls canMakePayment() on an SPC PaymentRequest.
 */
async function onCanMakePaymentClicked() {
  try {
    const request = buildSPCPaymentRequest();
    const canMakePaymentResult = await request.canMakePayment();
    info(`canMakePayment() result: ${canMakePaymentResult}`);
  } catch (err) {
    error(`canMakePayment() error: ${err}`);
  }
}

/**
 * Calls show() on an SPC PaymentRequest.
 */
async function onShowClicked() {
  try {
    const request = buildSPCPaymentRequest();
    const instrumentResponse = await request.show();
    await instrumentResponse.complete(/* result = */ 'success');
    console.log(instrumentResponse);
    info(
        windowLocalStorageIdentifier + ' payment response: ' +
        objectToString(instrumentResponse));
  } catch (err) {
    error(`show() error: ${err}`);
  }
}

if (PublicKeyCredential) {
  if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      .then((available) => {
        info(`isUserVerifyingPlatformAuthenticatorAvailable: ${available}`);
      }).catch((err) => {
        error(`Error when calling isUserVerifyingPlatformAuthenticatorAvailable: ${err.message}`);
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
    }).catch((err) => {
      error(`Error when calling PaymentRequest.securePaymentConfirmationAvailability: ${err.message}`);
    });
} else {
  info('PaymentRequest.securePaymentConfirmationAvailability method not available');
}

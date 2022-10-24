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

function clearEnrolledCredential(windowLocalStorageIdentifier) {
  window.localStorage.removeItem(windowLocalStorageIdentifier);
}

let gPaymentRequest = null;

// TODO: Show opt out option
async function createPaymentRequest(windowLocalStorageIdentifier) {
  try {
    gPaymentRequest = await createSPCPaymentRequest({
      credentialIds: [base64ToArray(window.localStorage.getItem(windowLocalStorageIdentifier))],
    });
    info('Created PaymentRequest object');
  } catch (e) {
    error(e);
  }
}

async function callCanMakePayment() {
  if (!gPaymentRequest) {
    error('gPaymentRequest is not set');
    return;
  }

  try {
    const cmp = await gPaymentRequest.canMakePayment();
    info('Called canMakePayment, result: ' + cmp);
  } catch (e) {
    error(e);
  }
}

async function callHasEnrolledInstrument() {
  if (!gPaymentRequest) {
    error('gPaymentRequest is not set');
    return;
  }

  try {
    const hei = await gPaymentRequest.hasEnrolledInstrument();
    info('Called hasEnrolledInstrument, result: ' + hei);
  } catch (e) {
    error(e);
  }
}

async function callShow() {
  if (!gPaymentRequest) {
    error('gPaymentRequest is not set');
    return;
  }

  try {
    const instrumentResponse = await gPaymentRequest.show();
    await instrumentResponse.complete('success')
    console.log(instrumentResponse);
    info('Called show, result: ' + objectToString(instrumentResponse));
  } catch (err) {
    error(err);
  }
}

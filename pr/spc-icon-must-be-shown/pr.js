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

/**
 * Launches payment request for SPC.
 */
async function onBuyClicked(windowLocalStorageIdentifier, iconUrl, iconMustBeShown) {
  try {
    const request = await createSPCPaymentRequest({
      credentialIds: [base64ToArray(window.localStorage.getItem(windowLocalStorageIdentifier))],
      instrument: {
        icon: iconUrl,
        iconMustBeShown,
      },
    });

    const instrumentResponse = await request.show();
    await instrumentResponse.complete('success')
    console.log(instrumentResponse);
    info(windowLocalStorageIdentifier + ' payment response: ' +
      objectToString(instrumentResponse));
  } catch (err) {
    error(err);
  }
}

/* exported createPaymentCredential */
/* exported onBuyClicked */

/**
 * Creates a credential.
 */
async function createPaymentCredential(windowLocalStorageIdentifier, usePaymentExtension) {
  const optionalOverrides = {
    // Hard-coding to always use the same user ID.
    // NOT RECOMMENDED FOR SPC.
    userIdOverride: 'user1234',
    // We need a discoverable credential for this demo, and so must use 'required'.
    residentKeyOverride: 'required',
  };
  try {
    const publicKeyCredential = await createCredential(usePaymentExtension, optionalOverrides);
    console.log(publicKeyCredential);
    window.localStorage.setItem(windowLocalStorageIdentifier,
      arrayBufferToBase64(publicKeyCredential.rawId));
    info(windowLocalStorageIdentifier + ' enrolled for ' + optionalOverrides.userIdOverride + ' (paymentExtension ? ' +
      usePaymentExtension  + '): ' + objectToString(publicKeyCredential));
  } catch (err) {
    error(err);
  }
}

/**
 * Launches payment request for SPC.
 */
async function onBuyClicked(windowLocalStorageIdentifier) {
  try {
    const request = await createSPCPaymentRequest({
      credentialIds: [base64ToArray(window.localStorage.getItem(windowLocalStorageIdentifier))],
    });

    const instrumentResponse = await request.show();
    await instrumentResponse.complete('success')
    console.log(instrumentResponse);
    info('SPC succeeded! ' + windowLocalStorageIdentifier + ' payment response: ' +
      objectToString(instrumentResponse));
  } catch (err) {
    error('SPC failed: ' + err);
  }
}

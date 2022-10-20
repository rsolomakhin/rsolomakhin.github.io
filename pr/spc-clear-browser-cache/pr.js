/* exported createPaymentCredential */
/* exported onBuyClicked */
const textEncoder = new TextEncoder();

/**
 * Creates a payment credential.
 */
async function createPaymentCredential() {
  try {
    const publicKeyCredential = await createCredential(/*setPaymentExtension=*/true);
    console.log(publicKeyCredential);
    document.getElementById('credential').value = arrayBufferToBase64(publicKeyCredential.rawId);
    info('Enrolled: ' + objectToString(publicKeyCredential));
  } catch (err) {
    error(err);
  }
}

/**
 * Launches payment request for SPC.
 */
async function onBuyClicked() {
  try {
    const request = await createSPCPaymentRequest({
      credentialIds: [base64ToArray(document.getElementById('credential').value)],
    });

    const instrumentResponse = await request.show();
    await instrumentResponse.complete('success')
    console.log(instrumentResponse);
    info(document.getElementById('credential').value + ' payment response: ' +
      objectToString(instrumentResponse));
  } catch (err) {
    error(err);
  }
}

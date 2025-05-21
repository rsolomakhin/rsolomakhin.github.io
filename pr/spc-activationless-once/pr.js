/* exported onBuyClicked */

/**
 * Launches payment request for SPC.
 */
async function onBuyClicked(windowLocalStorageIdentifier) {
  try {
    const request = await createSPCPaymentRequest({
      credentialIds: [base64ToArray(window.localStorage.getItem(windowLocalStorageIdentifier))],
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
    info(windowLocalStorageIdentifier + ' payment response: ' +
      objectToString(instrumentResponse));
  } catch (err) {
    error(err);
  }
}

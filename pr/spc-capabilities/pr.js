/* exported onListClicked */

/**
 * Calls static getSecurePaymentConfirmationCapabilities method on payment request.
 */
async function onListClicked() {
  try {
    if (!PaymentRequest) {
      error('PaymentRequest API is not supported.');
      return;
    }

    if (!PaymentRequest.getSecurePaymentConfirmationCapabilities) {
      error('PaymentRequest.getSecurePaymentConfirmationCapabilities API is not supported.');
      return;
    }

    const capabilities = await PaymentRequest.getSecurePaymentConfirmationCapabilities();

    info(JSON.stringify(capabilities, undefined, 2));
  } catch (err) {
    error(err);
  }
}

/* exported checkCapabilities */

/**
 * Calls static getSecurePaymentConfirmationCapabilities method on PaymentRequest
 * and displays the result visually.
 */
async function checkCapabilities() {
  clearAllMessages();

  try {
    if (typeof PaymentRequest === 'undefined') {
      error('PaymentRequest API is not supported.');
      return;
    }

    if (!PaymentRequest.getSecurePaymentConfirmationCapabilities) {
      error('PaymentRequest.getSecurePaymentConfirmationCapabilities API is not supported.');
      return;
    }

    info('Calling PaymentRequest.getSecurePaymentConfirmationCapabilities()...');
    const capabilities = await PaymentRequest.getSecurePaymentConfirmationCapabilities();

    clearAllMessages();
    info(JSON.stringify(capabilities, undefined, 2));
  } catch (err) {
    clearAllMessages();
    error(err && err.message ? err.message : String(err));
  }
}

window.addEventListener('load', () => {
  checkCapabilities();
});

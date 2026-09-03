/* exported checkCapabilities */

let checkCount = 0;

/**
 * Calls static getSecurePaymentConfirmationCapabilities method on PaymentRequest
 * and displays the result visually.
 */
async function checkCapabilities() {
  checkCount++;
  const now = new Date();
  const timeString = now.toLocaleTimeString() + '.' + String(now.getMilliseconds()).padStart(3, '0');
  const runHeader = `Run #${checkCount} at ${timeString}`;

  clearAllMessages();

  try {
    if (typeof PaymentRequest === 'undefined') {
      error(`[${runHeader}] PaymentRequest API is not supported.`);
      return;
    }

    if (!PaymentRequest.getSecurePaymentConfirmationCapabilities) {
      error(`[${runHeader}] PaymentRequest.getSecurePaymentConfirmationCapabilities API is not supported.`);
      return;
    }

    const capabilities = await PaymentRequest.getSecurePaymentConfirmationCapabilities();

    clearAllMessages();
    info(`Capabilities [${runHeader}]:\n` + JSON.stringify(capabilities, undefined, 2));
  } catch (err) {
    clearAllMessages();
    error(`Error [${runHeader}]: ` + (err && err.message ? err.message : String(err)));
  }
}

window.addEventListener('load', () => {
  checkCapabilities();
});

/* exported onScanClicked */

/**
 * Launches payment request to scan a localhost port.
 */
async function onScanClicked() {
  let port = document.getElementById("port").value;
  info(`Scanning port: ${port}`)

  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    const request = new PaymentRequest(
      [{ supportedMethods: `http://localhost:${port}/manifest.json` }],
      {
        total: {
          label: "Total",
          amount: { currency: "USD", value: "1.00" }
        }
      }
    );
    const response = await request.show();
    error(`Unexpected payment success: ${response}`);
    await response.complete("success");
  } catch (err) {
    console.log("Payment failed: " + err);
    let errMsg = err.message;
    if (errMsg.includes('ERR_CONNECTION_REFUSED')) {
      info(`Port ${port} CLOSED`);
    } else {
      if (errMsg.indexOf('HTTP header') !== -1) {
        info(`Port ${port} OPEN with result: ${errMsg}`);
      } else if (errMsg.indexOf('HTTP') !== -1) {
        info(`Port ${port} OPEN with result: ${errMsg.slice(errMsg.indexOf('HTTP'))}`);
      } else if (errMsg.indexOf('ERR_') !== -1) {
        info(`Port ${port} OPEN with result: ${errMsg.slice(errMsg.indexOf('ERR_'))}`);
      } else {
        info(`Port ${port} OPEN with result: ${errMsg}`);
      }
    }

  }
}

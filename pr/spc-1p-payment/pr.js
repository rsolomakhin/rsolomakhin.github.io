/* exported triggerSPC */
let credentialId;

/**
 * Launches payment request for SPC.
 */
async function triggerSPC() {
  try {
    const request = await createSPCPaymentRequest({
      credentialIds: [base64ToArray(credentialId)],
      rpId: 'spc-1p-payment-demo.glitch.me',
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

window.addEventListener('message', e => {
  if (e.data.type !== 'enrollment') return;
  credentialId = e.data.credential;
  document.getElementById("triggerSPC").disabled = false;
  info('Received credential ID: ' + credentialId);
});

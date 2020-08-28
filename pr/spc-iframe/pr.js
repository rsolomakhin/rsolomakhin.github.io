/* exported createPaymentCredential */
/* exported onBuyClicked */

const textEncoder = new TextEncoder();

/**
 * Creates a payment credential.
 */
async function createPaymentCredential() {
  const rp = {
    id: 'rsolomakhin.github.io',
    name: 'Rouslan Solomakhin',
  };
  const instrument = {
    displayName: 'Troy ····',
    icon: 'https://rsolomakhin.github.io/pr/spc/troy.png',
  };
  const pubKeyCredParams = [{
    type: 'public-key',
    alg: -7,
  }];
  const authenticatorSelection = {
    userVerification: "required",
  };
  const payment = {
    rp,
    instrument,
    challenge: textEncoder.encode('Transaction approval challenge'),
    pubKeyCredParams,
    authenticatorSelection,
  };
  try {
    const publicKeyCredential = await navigator.credentials.create({payment});
    window.localStorage.setItem(
        'iframe_credential_identifier',
        btoa(String.fromCharCode(...new Uint8Array(
            publicKeyCredential.rawId))));
    info('Credential ' +
         window.localStorage.getItem('iframe_credential_identifier') +
         ' enrolled.');
  } catch (err) {
    error(err);
  }
}

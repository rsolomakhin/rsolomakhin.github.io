function info(msg) {
  let element = document.createElement('pre');
  element.innerHTML = msg;
  document.getElementById('msg').appendChild(element);
}

async function createPaymentCredential() {
  const rp = {
    id: 'lumbar-brick-soup.glitch.me',
    name: 'Rouslan Solomakhin',
  };
  const instrument = {
    displayName: 'Troy ····',
    icon: 'https://rsolomakhin.github.io/pr/spc/troy.png',
  };
  const pubKeyCredParams = [{
    type: 'public-key',
    alg: -7,  // ECDSA, not supported on Windows.
  }, {
    type: 'public-key',
    alg: -257,  // RSA, supported on Windows.
  }];
  const authenticatorSelection = {
    userVerification: "required",
  };
  const payment = {
    rp,
    instrument,
    challenge: new TextEncoder().encode('Transaction approval challenge'),
    pubKeyCredParams,
    authenticatorSelection,
  };
  try {
    info('Creating credential...');
    const publicKeyCredential = await navigator.credentials.create({payment});
    info('Got credential. Storing...');
    window.localStorage.setItem(
        'pr_window_credential',
        btoa(String.fromCharCode(...new Uint8Array(
            publicKeyCredential.rawId))));
    info('Credential ' +
         window.localStorage.getItem('pr_window_credential') +
         ' enrolled.');
  } catch (err) {
    info(err);
  }
}
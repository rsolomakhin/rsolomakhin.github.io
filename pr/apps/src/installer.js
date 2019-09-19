function showMessage(message) {
  const messageElement = document.getElementById('msg');
  messageElement.innerHTML = message + '\n' + messageElement.innerHTML;
}

function clearMessages() {
  document.getElementById('msg').innerHTML = '';
}

function showElement(id) {
  document.getElementById(id).style.display = 'block';
}

function hideElement(id) {
  document.getElementById(id).style.display = 'none';
}

function hideElements() {
  const elements = [
    'checking',
    'installed',
    'installing',
    'uninstalling',
    'not-installed',
  ];
  for (const id of elements) {
    hideElement(id);
  }
}

async function check() {
  clearMessages();
  hideElements();
  showElement('checking');

  if (!navigator.serviceWorker) {
    hideElement('checking');
    showMessage('No service worker capability in this browser.');
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration('app.js');
    if (!registration) {
      hideElement('checking');
      showElement('not-installed');
      return;
    }
    document.getElementById('scope').innerHTML = registration.scope;
    if (!registration.paymentManager) {
      hideElement('checking');
      showElement('not-installed');
      showMessage('No payment handler capability in this browser. Is chrome://flags/#service-worker-payment-apps enabled?');
      return;
    }
    if (!registration.paymentManager.instruments) {
      hideElement('checking');
      showElement('not-installed');
      showMessage('Payment handler is not fully implemented. Cannot set the instruments.');
      return;
    }
    const result = await registration.paymentManager.instruments.has('instrument-key');
    if (!result) {
      hideElement('checking');
      showElement('not-installed');
      showMessage('No instruments found. Did installation fail?');
      return;
    }
    const instrument = await registration.paymentManager.instruments.get('instrument-key');
    document.getElementById('method').innerHTML = instrument.method;
    hideElement('checking');
    showElement('installed');
  } catch (error) {
    hideElement('checking');
    showElement('not-installed');
    showMessage(error);
  }
}

const publicKeyCredentialCreationOptions = {
    challenge: Uint8Array.from(
        'INSECURE.SHOULD-BE-A-RANDOM-STRING-FROM-SERVER', c => c.charCodeAt(0)),
    rp: {
        name: "rsolomakhin.github.io",
        id: "rsolomakhin.github.io",
    },
    user: {
        id: Uint8Array.from(
            "IOFIVBNMUJ", c => c.charCodeAt(0)),
        name: "insecure-demo@rsolomakhin.github.io",
        displayName: "Demo, Insecure",
    },
    pubKeyCredParams: [{alg: -7, type: "public-key"}],
    authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "discouraged",
    },
    timeout: 60000,
    attestation: "none"
};

async function install() {
  hideElements();
  showElement('installing');

  try {
    await navigator.serviceWorker.register('app.js');
    const registration = await navigator.serviceWorker.ready;
    if (!registration.paymentManager) {
      hideElement('installing');
      showMessage('No payment handler capability in this browser.');
      return;
    }
    if (!registration.paymentManager.instruments) {
      hideElement('installing');
      showMessage('Payment handler is not fully implemented. Cannot set the instruments.');
      return;
    }
    await registration.paymentManager.instruments.set('instrument-key', {
      name: 'Citi ****1234',
      icons: [{src:'card_art.png', sizes: '960x607',type: 'image/png'}],
      method: 'src-card',
    });
    await registration.paymentManager.instruments.set('instrument-key-2', {
      name: 'CapitalOne ****5678',
      icons: [{src:'card_art_2.png', sizes: '960x623',type: 'image/png'}],
      method: 'src-card',
    });
    document.getElementById('scope').innerHTML = registration.scope;
    document.getElementById('method').innerHTML = 'src-card';
    if (navigator.credentials && navigator.credentials.create) {
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });
    }
    hideElement('installing');
    showElement('installed');
  } catch(error) {
    hideElement('installing');
    showMessage(error);
  }
}

function uninstall() {
  hideElements();
  showElement('uninstalling');

  navigator.serviceWorker
    .getRegistration('app.js')
    .then(registration => {
      registration
        .unregister()
        .then(result => {
          if (result) {
            hideElement('uninstalling');
            showElement('not-installed');
          } else {
            hideElement('uninstalling');
            showElement('installed');
            showMessage(
              'Service worker unregistration returned "false", which indicates that it failed.',
            );
          }
        })
        .catch(error => {
          hideElement('uninstalling');
          showMessage(error);
        });
    })
    .catch(error => {
      hideElement('uninstalling');
      showMessage(error);
    });
}

check();

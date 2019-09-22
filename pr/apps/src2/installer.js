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

const publicKeyCredentialCreationOptions = {
    challenge: Uint8Array.from(
        'INSECURE.SHOULD-BE-A-RANDOM-STRING-FROM-SERVER', c => c.charCodeAt(0)),
    rp: {
        name: 'rsolomakhin.github.io',
        id: 'rsolomakhin.github.io',
    },
    user: {
        id: Uint8Array.from(
            'IOFIVBNMUJ', c => c.charCodeAt(0)),
        name: 'insecure-demo@rsolomakhin.github.io',
        displayName: 'Demo, Insecure',
    },
    pubKeyCredParams: [{alg: -7, type: 'public-key'}],
    authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'discouraged',
    },
    timeout: 60000,
    attestation: 'none'
};

async function install() {
  hideElements();
  showElement('installing');


  try {
    if (navigator.credentials && navigator.credentials.create) {
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });
    }

    ////////////////////////////////////////////////////////////////////////////
    //
    // Install the first card.
    //
    ////////////////////////////////////////////////////////////////////////////
    window.location.href = './card1';
  } catch(error) {
    hideElement('installing');
    showMessage(error);
  }
}

async function uninstall() {
  hideElements();
  showElement('uninstalling');

  try {
    let registration = await navigator.serviceWorker.getRegistration('app.js?card=1');
    if (registration) {
      await registration.unregister();
    }
    registration = await navigator.serviceWorker.getRegistration('app.js?card=2');
    if (registration) {
      let result = await registration.unregister();
      if (!result) {
        hideElement('uninstalling');
        showElement('installed');
        showMessage('Service worker unregistration returned "false", which indicates that it failed.');
      }
    }
    hideElement('uninstalling');
    showElement('not-installed');
  } catch (error) {
    hideElement('uninstalling');
    showMessage(error);
  }
}

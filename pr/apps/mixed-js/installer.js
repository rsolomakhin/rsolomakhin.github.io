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
  try {
    clearMessages();
    hideElements();
    showElement('checking');

    if (!navigator.serviceWorker) {
      hideElement('checking');
      showMessage('No service worker capability in this browser.');
      return;
    }

    let registration = await navigator.serviceWorker.getRegistration('app.js');
    if (!registration) {
      hideElement('checking');
      showElement('not-installed');
      return;
    }

    document.getElementById('scope').innerHTML = registration.scope;

    registration = await navigator.serviceWorker.ready;
    if (!registration) {
      hideElement('checking');
      showElement('not-installed');
      showMessage('Could not activate the service worker.');
      return;
    }

    if (!registration.paymentManager) {
      hideElement('checking');
      showElement('not-installed');
      showMessage('No payment handler capability in this browser.');
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

async function install() {
  try {
    hideElements();
    showElement('installing');

    await navigator.serviceWorker.register('app.js');

    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      hideElement('installing');
      showElement('not-installed');
      showMessage('Could not activate the service worker.');
      return;
    }

    document.getElementById('scope').innerHTML = registration.scope;

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
      name: 'Chrome uses name and icon from the web app manifest',
      method: 'basic-card',
    });

    const instrument = await registration.paymentManager.instruments.get('instrument-key');
    document.getElementById('method').innerHTML = instrument.method;
    hideElement('installing');
    showElement('installed');
  } catch (error) {
    hideElement('installing');
    showMessage(error);
  }
}

async function uninstall() {
  try {
    hideElements();
    showElement('uninstalling');

    const registration = await navigator.serviceWorker.getRegistration('app.js');
    const result = await registration.unregister();
    if (result) {
      hideElement('uninstalling');
      showElement('not-installed');
    } else {
      hideElement('uninstalling');
      showElement('installed');
      showMessage('Service worker unregistration returned "false", which indicates that it failed.');
    }
  } catch (error) {
    hideElement('uninstalling');
    showMessage(error);
  }
}

check();

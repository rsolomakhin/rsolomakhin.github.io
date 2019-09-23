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

async function install() {
  ////////////////////////////////////////////////////////////////////////////
  //
  // Install the first card.
  //
  ////////////////////////////////////////////////////////////////////////////
  window.location.href = './card1';
}

async function uninstall() {
  hideElements();
  showElement('uninstalling');

  try {
    let registration = await navigator.serviceWorker.getRegistration('./card1/app.js');
    if (registration) {
      await registration.unregister();
    }
    registration = await navigator.serviceWorker.getRegistration('./card2/app.js');
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

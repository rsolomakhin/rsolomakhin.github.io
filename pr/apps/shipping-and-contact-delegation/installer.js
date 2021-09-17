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

function check(
    delegations =
        ['shippingAddress', 'payerName', 'payerPhone', 'payerEmail']) {
  clearMessages();
  hideElements();
  showElement('checking');

  if (!navigator.serviceWorker) {
    hideElement('checking');
    showMessage('No service worker capability in this browser.');
    return;
  }
  navigator.serviceWorker.getRegistration('payment_handler.js')
      .then(registration => {
        if (!registration) {
          hideElement('checking');
          showElement('not-installed');
          return;
        }
        document.getElementById('scope').innerHTML = registration.scope;
        if (!registration.paymentManager) {
          hideElement('checking');
          showElement('not-installed');
          showMessage(
              'No payment handler capability in this browser. Is chrome://flags/#service-worker-payment-apps enabled?',
          );
          return;
        }
        if (!registration.paymentManager.enableDelegations) {
          setInstruments(registration);
          showMessage(
              'Shipping delegation is available on chrome 80 and later. Checkout chrome://version',
          );
          return;
        }
        registration.paymentManager.enableDelegations(delegations)
            .then(() => {
              setInstruments(registration);
              return;
            })
            .catch(error => {
              hideElement('checking');
              showElement('not-installed');
              showMessage(error);
            });
      })
      .catch(error => {
        hideElement('checking');
        showElement('not-installed');
        showMessage(error);
      });
}

function install(
    delegations =
        ['shippingAddress', 'payerName', 'payerPhone', 'payerEmail']) {
  hideElements();
  showElement('installing');

  navigator.serviceWorker.register('payment_handler.js')
      .then(() => {
        return navigator.serviceWorker.ready;
      })
      .then(registration => {
        if (!registration.paymentManager) {
          hideElement('installing');
          showMessage(
              'No payment handler capability in this browser. Is chrome://flags/#service-worker-payment-apps enabled?',
          );
          return;
        }
        if (!registration.paymentManager.enableDelegations) {
          setInstruments(registration);
          showMessage(
              'Shipping delegation is available on chrome 80 and later. Checkout chrome://version',
          );
          return;
        }
        registration.paymentManager.enableDelegations(delegations)
            .then(() => {
              setInstruments(registration);
            })
            .catch(error => {
              hideElement('installing');
              showMessage(error);
            });
      })
      .catch(error => {
        hideElement('installing');
        showMessage(error);
      });
}

function setInstruments(registration) {
  if (!registration.paymentManager.instruments) {
    hideElement('installing');
    showMessage(
        'Payment handler is not fully implemented. Cannot set the instruments.',
    );
    return;
  }
  registration.paymentManager.instruments
      .set('instrument-key', {
        name: 'Chrome uses name and icon from the web app manifest',
        method: 'basic-card',
        capabilities: {
          supportedNetworks: ['visa'],
        },
      })
      .then(() => {
        registration.paymentManager.instruments.get('instrument-key')
            .then(instrument => {
              document.getElementById('scope').innerHTML = registration.scope;
              document.getElementById('method').innerHTML =
                  instrument.method;
              document.getElementById('network').innerHTML =
                  instrument.capabilities.supportedNetworks;
              hideElement('installing');
              showElement('installed');
            })
            .catch(error => {
              hideElement('installing');
              showMessage(error);
            });
      })
      .catch(error => {
        hideElement('installing');
        showMessage(error);
      });
}

function uninstall() {
  hideElements();
  showElement('uninstalling');

  navigator.serviceWorker.getRegistration('payment_handler.js')
      .then(registration => {
        registration.unregister()
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

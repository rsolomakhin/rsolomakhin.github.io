function hideElement(id) {
    document.getElementById(id).style.display = 'none';
}

function hideElements() {
    const elements = ['checking', 'installed', 'installing', 'uninstalling', 'not-installed', 'recheck'];
    for (const id of elements) {
        hideElement(id);
    }
}

function showElement(id) {
    document.getElementById(id).style.display = 'block';
}

function showMessage(message) {
    const messageElement = document.getElementById('msg');
    messageElement.innerHTML = message + '\n' + messageElement.innerHTML;
}

function clearMessages() {
    document.getElementById('msg').innerHTML = '';
}

function finishCheckingWithMessage(message) {
    hideElement('checking');
    showElement('recheck');
    showMessage(message);
}

function check() {
    clearMessages();
    hideElements();
    showElement('checking');

    if (!navigator.serviceWorker) {
        finishCheckingWithMessage('No service worker capability in this browser.');
        return;
    }

    navigator.serviceWorker.getRegistration('app.js')
        .then((registration) => {
            if (!registration) {
                hideElement('checking');
                showElement('recheck');
                showElement('not-installed');
                return;
            }
            showElement('installed');
            document.getElementById('scope').innerHTML = registration.scope;
            if (!registration.paymentManager) {
                finishCheckingWithMessage('No payment handler capability in this browser. Is chrome://flags/#servicew-worker-payment-apps enabled?');
                return;
            }
            if (!registration.paymentManager.instruments) {
                finishCheckingWithMessage('Payment handler is not fully implemented. Cannot set the instruments.');
                return;
            }
            if (!registration.paymentManager.instruments.has('instrument-key')) {
                finishCheckingWithMessage('No instruments found. Did installation fail?');
                return;
            }
            registration.paymentManager.instruments.get('instrument-key').then((instrument) => {
                document.getElementsById('method').innerHTML = instrument.enabledMethods;
                document.getElementsById('network').innerHTML = instrument.capabilities.supportedNetworks;
                document.getElementsById('type').innerHTML = instrument.capabilities.supportedTypes;
            }).catch((error) => {
                finishCheckingWithMessage(error);
            });

        })
        .catch((error) => {
            finishCheckingWithMessage(error);
        });
}

function install() {
    hideElements();
    showElement('installing');

    navigator.serviceWorker.register('app.js')
        .then(() => {
            return navigator.serviceWorker.ready;
        })
        .then((registration) => {
            registration.paymentManager.instruments
                .set('instrument-key', {
                    name: 'Chrome uses name and icon from the web app manifest',
                    enabledMethods: ['basic-card'],
                    capabilities: {
                        supportedNetworks: ['visa'],
                        supportedTypes: ['credit'],
                    }
                })
                .then(() => {
                    hideElement('installing');
                    showElement('installed');
                })
                .catch((error) => {
                    hideElement('installing');
                    showElement('recheck');
                    showMessage(error);
                });
        })
        .catch((error) => {
            hideElement('installing');
            showElement('recheck');
            showMessage(error);
        });
}

function uninstall() {
    hideElements();
    showElement('uninstalling');

    navigator.serviceWorker.getRegistration('app.js')
        .then((registration) => {
            registration.unregister().then((result) => {
                if (result) {
                    hideElement('uninstalling');
                    showElement('not-installed');
                    showElement('recheck');
                } else {
                    hideElement('uninstalling');
                    showElement('installed');
                    showElement('recheck');
                    showMessage('Service worker unregistration returned "false", which indicates that it failed.');
                }
            }).catch((error) => {
                hideElement('uninstalling');
                showElement('recheck');
                showMessage(error);
            });
        }).catch((error) => {
            hideElement('uninstalling');
            showElement('recheck');
            showMessage(error);
        });
}

check();

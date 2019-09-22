function showMessage(message) {
  const messageElement = document.getElementById('msg');
  messageElement.innerHTML = message + '\n' + messageElement.innerHTML;
}

function hideElement(id) {
  document.getElementById(id).style.display = 'none';
}

async function install() {
  try {
    ////////////////////////////////////////////////////////////////////////////
    //
    // Each card has its own service worker URL and scope, which enables showing
    // it on a separate line in the browser UI. The contents of the 'app.js' are
    // shared among all cards.
    //
    ////////////////////////////////////////////////////////////////////////////
    await navigator.serviceWorker.register('app.js', {scope: './'});
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
    ////////////////////////////////////////////////////////////////////////////
    //
    // Browser takes payment handler take name and icons from the web app
    // manifest linked from the HTML page, which is 'manifest.json' in this
    // case. The 'name' and 'icons' fields below are not used in browser UI.
    //
    ////////////////////////////////////////////////////////////////////////////
    await registration.paymentManager.instruments.set('card-id', {
      name: 'CapitalOne ****5678',
      icons: [{src:'card_art_2.png', sizes: '960x623',type: 'image/png'}],
      method: 'https://rsolomakhin.github.io/pr/apps/src2',
    });
    window.location.href = '../';
  } catch(error) {
    hideElement('installing');
    showMessage(error);
  }
}

install();

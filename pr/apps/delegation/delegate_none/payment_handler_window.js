const msg = document.getElementById('msg');
function output(message) {
  msg.innerHTML = message;
  console.log(message);
}

const currency = document.getElementById('currency');
const value = document.getElementById('value');
function updateAmount(currencyUpdate, valueUpdate) {
  currency.innerHTML = currencyUpdate;
  value.innerHTML = valueUpdate;
}

const pleasewait = document.getElementById('pleasewait');
const button = document.getElementById('confirm');
button.addEventListener('click', (evt) => {
  if (navigator.serviceWorker.controller) {
    button.style.display = 'none';
    pleasewait.style.display = 'block';

    response = {
      type: 'confirm',
      // No delegated information to send back!
    };
    navigator.serviceWorker.controller.postMessage(response);
  } else {
    output('Error: No service worker controller found!');
  }
});

navigator.serviceWorker.addEventListener('message', (evt) => {
  if (!evt.data) {
    output('Error: Received an empty message');
    return;
  }

  if (evt.data.error) {
    output('Error: ' + evt.data.error);
    return;
  }

  if (evt.data.total) {
    updateAmount(evt.data.total.currency, evt.data.total.value);
  }
});

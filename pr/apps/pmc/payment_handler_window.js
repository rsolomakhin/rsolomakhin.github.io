let response = response1;

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

const button = document.getElementById('confirm');
const pleasewait = document.getElementById('pleasewait');
button.addEventListener('click', (evt) => {
  if (navigator.serviceWorker.controller) {
    button.style.display = 'none';
    pleasewait.style.display = 'block';
    navigator.serviceWorker.controller.postMessage('confirm');
  } else {
    output('Service worker controller found');
  }
});

function changePaymentMethod(which_one) {
  let message = '';
  if (which_one === 1) {
    response = response1;
    message = 'change-method-1';
  } else if (which_one === 2) {
    response = response2;
    message = 'change-method-2';
  } else {
    output('Unknown payment method identifier ' + which_one.toString());
    return;
  }

  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  } else {
    output('Service worker controller found');
  }
}

const billingAddress1 = document.getElementById('billing-address-1');
billingAddress1.addEventListener('click', (evt) => {
  changePaymentMethod(1);
});

const billingAddress2 = document.getElementById('billing-address-2');
billingAddress2.addEventListener('click', (evt) => {
  changePaymentMethod(2);
});

navigator.serviceWorker.addEventListener('message', (evt) => {
  if (!evt.data) {
    output('Received an empty message');
    return;
  }

  if (evt.data.error) {
    output(evt.data.error);
  }

  if (evt.data.total) {
    updateAmount(evt.data.total.currency, evt.data.total.value);
  }
});

function init() {
  const params = new URLSearchParams(window.location.search);
  const currency = params.get('currency');
  const amount = params.get('amount');
  if (currency && amount) {
    updateAmount(currency, amount);
  }
}
init();

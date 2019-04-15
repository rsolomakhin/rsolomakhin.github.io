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

const parts = window.location.href.split('#');
let id = 'N/A';
if (parts.length === 4) {
  id = parts[1];
  updateAmount(parts[2], parts[3]);
} else {
  output('Could not parse the Payment Request ID, total currency, and total value from the URL');
}

const pleasewait = document.getElementById('pleasewait');
let paymentManager = null;
function init() {
  pleasewait.style.display = 'block';
  navigator.serviceWorker.getRegistration('app.js').then((registration) => {
    if (!registration) {
      output('Service worker not installed');
    } else if (!registration.paymentManager) {
      output('Payment manager not found');
    } else {
      paymentManager = registration.paymentManager;
    }
    pleasewait.style.display = 'none';
  }).catch((error) => {
    output(error);
    pleasewait.style.display = 'none';
  });
}
init();

const button = document.getElementById('confirm');
button.addEventListener('click', (evt) => {
  button.style.display = 'none';
  pleasewait.style.display = 'block';
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage('confirm');
  } else {
    output('No service worker controller found');
    pleasewait.style.display = 'none';
  }
});

function firePaymentMethodChangeEvent(details) {
  if (!paymentManager) {
    output('Payment manager not found');
    return;
  }
  if (!paymentManager.fireEvent) {
    output('No event firing feature in the payment manager');
    return;
  }
  pleasewait.style.display = 'block';
  paymentManager.fireEvent('basic-card', id, 'paymentmethodchange', details).then((paymentHandlerUpdate) => {
    updateAmount(paymentHandlerUpdate.total.currency, paymentHandlerUpdate.total.value);
    if (paymentHandlerUpdate.error) {
      output(error);
    }
    pleasewait.style.display = 'none';
  }).catch((error) => {
    output(error);
    pleasewait.style.display = 'none';
  });
}

const billingAddress1 = document.getElementById('billing-address-1');
billingAddress1.addEventListener('click', (evt) => {
  firePaymentMethodChangeEvent({
    billingAddress: {
        city: 'Venice',
        country: 'US',
        postalCode: '20191',
        region: 'VA',
    },
    cardNumber: '****1111',
    cardNetwork: 'visa',
  });
});

const billingAddress2 = document.getElementById('billing-address-2');
billingAddress2.addEventListener('click', (evt) => {
  firePaymentMethodChangeEvent({
    billingAddress: {
        city: 'London',
        country: 'GB',
        postalCode: 'WC2H 8AG',
    },
    cardNumber: '****5454',
    cardNetwork: 'mastercard',
  });
});

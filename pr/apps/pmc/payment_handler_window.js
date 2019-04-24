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

const pleasewait = document.getElementById('pleasewait');
let paymentRequestEvent = null;
function init() {
  pleasewait.style.display = 'block';
  navigator.serviceWorker.getRegistration('payment_handler.js').then((registration) => {
    if (!registration) {
      output('Service worker not installed.');
      pleasewait.style.display = 'none';
    } else if (!registration.paymentManager) {
      output('Payment manager not found.');
      pleasewait.style.display = 'none';
    } else if (!registration.paymentManager.paymentRequestEvent) {
      output('Payment request event is not implemented yet.');
      pleasewait.style.display = 'none';
    } else {
      registration.paymentManager.paymentRequestEvent.then((evt) => {
        if (evt) {
          output('Received the payment request event.');
          paymentRequestEvent = evt;
        } else {
          output('Failed to retrieve the payment request event.');
        }
        pleasewait.style.display = 'none';
      }).catch((error) => {
        output(error);
        pleasewait.style.display = 'none';
      });
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
  if (paymentRequestEvent) {
    button.style.display = 'none';
    pleasewait.style.display = 'block';
    try {
      paymentRequestEvent.respondWith(response);
    } catch (error) {
      output(error);
      button.style.display = 'block';
      pleasewait.style.display = 'none';
    }
  } else if (navigator.serviceWorker.controller) {
    button.style.display = 'none';
    pleasewait.style.display = 'block';
    navigator.serviceWorker.controller.postMessage('confirm');
  } else {
    output('Neither payment request event nor service worker controller found');
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

  if (paymentRequestEvent) {
    if (!paymentRequestEvent.changePaymentMethod) {
      output('No method change feature in the payment request event.');
      return;
    }
    pleasewait.style.display = 'block';
    paymentRequestEvent.changePaymentMethod(response.methodName, redact(response)).then((paymentHandlerUpdate) => {
      pleasewait.style.display = 'none';
      if (!paymentHandlerUpdate) {
        return;
      }
      if (paymentHandlerUpdate.error) {
        output(error);
      }
      pleasewait.style.display = 'none';
    }).catch((error) => {
      output(error);
      pleasewait.style.display = 'none';
    });
  } else if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  } else {
    output('Neither payment request event nor service worker controller found');
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

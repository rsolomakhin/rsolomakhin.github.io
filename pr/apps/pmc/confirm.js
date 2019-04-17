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
  navigator.serviceWorker.getRegistration('app.js').then((registration) => {
    if (!registration) {
      output('Service worker not installed');
      pleasewait.style.display = 'none';
    } else if (!registration.paymentManager) {
      output('Payment manager not found');
      pleasewait.style.display = 'none';
    } else if (!registration.paymentManager.paymentRequestEvent) {
      output('paymentManager.paymentRequestEvent is not implemented yet');
      pleasewait.style.display = 'none';
    } else {
      registration.paymentManager.paymentRequestEvent.then((evt) => {
        if (evt) {
          output('Received the payment request event');
          paymentRequestEvent = evt;
        } else {
          output('Failed to retrieve the payment request event');
        }
        pleasewait.style.display = 'none';
      }).catch((error) => {
        output(error);
        pleasewait.style.display = 'none';
      });
    }
  }).catch((error) => {
    output(error);
    pleasewait.style.display = 'none';
  });
}
init();

const button = document.getElementById('confirm');
button.addEventListener('click', (evt) => {
  if (!paymentRequestEvent) {
    output('Payment request event not found');
    return;
  }
  button.style.display = 'none';
  pleasewait.style.display = 'block';
  try {
    paymentRequestEvent.respondWith({
      methodName: 'basic-card',
      details: {
          billingAddress: {
              addressLine: [
                  '1875 Explorer St #1000',
              ],
              city: 'Reston',
              country: 'US',
              dependentLocality: '',
              languageCode: '',
              organization: 'Google',
              phone: '+15555555555',
              postalCode: '20190',
              recipient: 'Jon Doe',
              region: 'VA',
              sortingCode: ''
          },
          cardNumber: '4111111111111111',
          cardSecurityCode: '123',
          cardholderName: 'Jon Doe',
          expiryMonth: '01',
          expiryYear: '2020',
      },
    });
  } catch (error) {
    output(error);
    button.style.display = 'block';
    pleasewait.style.display = 'none';
  }
});

function firePaymentMethodChangeEvent(details) {
  if (!paymentRequestEvent) {
    output('Payment request event not found');
    return;
  }
  if (!paymentRequestEvent.changePaymentMethod) {
    output('No method change feature in the payment manager');
    return;
  }
  pleasewait.style.display = 'block';
  paymentRequestEvent.changePaymentMethod('basic-card', details).then((paymentHandlerUpdate) => {
    pleasewait.style.display = 'none';
    if (!paymentHandlerUpdate) {
      return;
    }
    if (paymentHandlerUpdate.error) {
      output(error);
    }
    updateAmount(paymentHandlerUpdate.total.currency, paymentHandlerUpdate.total.value);
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

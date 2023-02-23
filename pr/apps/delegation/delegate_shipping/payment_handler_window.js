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
      shippingAddress: {
        recipient: document.getElementById('name_field').value,
        phone: document.getElementById('phone_field').value,
        addressLine: [
          document.getElementById('street_field').value,
        ],
        city: document.getElementById('city_field').value,
        region: document.getElementById('state_field').value,
        country: document.getElementById('country_field').value,
        postalCode: document.getElementById('zip_field').value,
      },
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

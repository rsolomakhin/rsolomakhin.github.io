const msg = document.getElementById('msg');
function output(message) {
  msg.innerHTML = message;
  console.log(message);
}

const currency = document.getElementById('currency');
const value = document.getElementById('value');
const button = document.getElementById('confirm');
function updateAmount(currencyUpdate, valueUpdate) {
  currency.innerHTML = currencyUpdate;
  value.innerHTML = valueUpdate;
  if (currencyUpdate === 'N/A')
    button.disabled = true;
  else
    button.disabled = false;
}

const pleasewait = document.getElementById('pleasewait');
button.addEventListener('click', () => {
  if (navigator.serviceWorker.controller) {
    button.style.display = 'none';
    pleasewait.style.display = 'block';
    navigator.serviceWorker.controller.postMessage('confirm');
  } else {
    output('Service worker controller found');
  }
});

function isValidCountryCodeFormat(code) {
  return code && code.match('^[A-Z]{2}$');
}

const submit = document.getElementById('submit');
submit.addEventListener('click', () => {
  const countryCode = document.getElementById('country').value;
  if (!isValidCountryCodeFormat(countryCode)) {
    output(
        '\'' + countryCode +
        '\' is not a valid CLDR country code, should be 2 upper case letters [A-Z].');
    return;
  }
  // Create shipping address from form values.
  let address = {
    'addressLine': [
      document.getElementById('addressLine').value,
    ],
    'city': document.getElementById('city').value,
    'country': document.getElementById('country').value,
    'dependentLocality': document.getElementById('dependentLocality').value,
    'organization': document.getElementById('organization').value,
    'phone': document.getElementById('phone').value,
    'postalCode': document.getElementById('postalCode').value,
    'recipient': document.getElementById('recipient').value,
    'region': document.getElementById('region').value,
    'sortingCode': document.getElementById('sortingCode').value,
  }

  changeShippingAddress(address);
  document.getElementById('addressForm').clear();
})


function changeShippingAddress(address) {
  msg.innerHTML = '';
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({'newAddress': address});
  } else {
    output('Service worker controller not found');
  }
}

navigator.serviceWorker.addEventListener('message', (evt) => {
  if (!evt.data) {
    output('Received an empty message');
    return;
  }

  if (evt.data.requestData) {
    init(evt.data.requestData.shippingType, evt.data.requestData.total);
    return;
  }

  if (evt.data.error) {
    updateAmount('N/A', 'N/A');
    output('error:\t' + evt.data.error);
    return;
  }

  if (evt.data.total) {
    updateAmount(evt.data.total.currency, evt.data.total.value);
  }
});

function init(shippingType, total) {
  document.getElementById('shippingType').innerHTML =
      'please insert ' + shippingType + ' address:';
  if (total.currency && total.value) {
    updateAmount(total.currency, total.value);
  } else {
    updateAmount('N/A', 'N/A');
  }
}

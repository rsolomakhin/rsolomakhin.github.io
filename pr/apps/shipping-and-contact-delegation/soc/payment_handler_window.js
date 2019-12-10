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
button.addEventListener('click', (evt) => {
  if (navigator.serviceWorker.controller) {
    button.style.display = 'none';
    pleasewait.style.display = 'block';
    navigator.serviceWorker.controller.postMessage('confirm');
  } else {
    output('Service worker controller found');
  }
});

function changeShippingOption(shippingOptionId) {
  msg.innerHTML = '';
  updateAmount('N/A', 'N/A');
  if (document.getElementById(shippingOptionId)) {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(
          'change-option-' + shippingOptionId);
    } else {
      output('Service worker controller not found.');
    }
  } else {
    output('Unknown shipping option identifier ' + shippingOptionId);
  }
}

function addShippingOptions(options) {
  var shippingOptionsDiv = document.getElementById('shippingOptionsDiv');
  for (option of options) {
    var optionSelection = document.createElement('input');
    optionSelection.setAttribute('id', option.id);
    optionSelection.setAttribute('type', 'radio');
    optionSelection.setAttribute('name', 'shipping option');
    var divSelection = document.createElement('div');
    divSelection.appendChild(optionSelection);
    divSelection.innerHTML += option.label;
    shippingOptionsDiv.appendChild(divSelection);
    document.getElementById(option.id).checked = option.selected;
    document.getElementById(option.id).addEventListener('click', (evt) => {
      changeShippingOption(evt.target.id);
    });
  }
  // Add an invalid option to test invalid shipping option Id error handling.
  var optionSelection = document.createElement('input');
  optionSelection.setAttribute('id', 'invalid');
  optionSelection.setAttribute('type', 'radio');
  optionSelection.setAttribute('name', 'shipping option');
  var divSelection = document.createElement('div');
  divSelection.appendChild(optionSelection);
  divSelection.innerHTML += 'Invalid option';
  shippingOptionsDiv.appendChild(divSelection);
  document.getElementById('invalid').addEventListener('click', (evt) => {
    changeShippingOption(evt.target.id);
  });
}

navigator.serviceWorker.addEventListener('message', (evt) => {
  if (!evt.data) {
    output('Received an empty message');
    return;
  }

  if (evt.data.requestData) {
    init(evt.data.requestData.total, evt.data.requestData.shippingOptions);
    return;
  }

  if (evt.data.error) {
    output(evt.data.error);
    return;
  }

  if (evt.data.total) {
    updateAmount(evt.data.total.currency, evt.data.total.value);
  }
});

function init(total, shippingOptions) {
  addShippingOptions(shippingOptions);
  if (total.currency && total.value) {
    updateAmount(total.currency, total.value);
  } else {
    updateAmount('N/A', 'N/A');
  }
}

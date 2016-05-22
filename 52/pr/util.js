var timeoutID1, timeoutID2;
function error(msg) {
  if (timeoutID1) {
    window.clearTimeout(timeoutID1);
  }
  if (timeoutID2) {
    window.clearTimeout(timeoutID2);
  }
  var element = document.getElementById('msg');
  element.innerHTML = msg;
  element.className = 'error';
  timeoutID1 = window.setTimeout(function() {
    element.className = 'error-hide';
    timeoutID2 = window.setTimeout(function() {
      element.innerHTML = '';
      element.className = '';
    }, 500);
  }, 10000);
}

function info(msg) {
  var element = document.getElementById('msg');
  element.innerHTML = msg;
  element.className = 'info';
}

function toDictionary(addr) {
  var dict = {};
  if (addr) {
    dict.regionCode = addr.regionCode;
    dict.administrativeArea = addr.administrativeArea;
    dict.locality = addr.locality;
    dict.dependentLocality = addr.dependentLocality;
    dict.addressLine = addr.addressLine;
    dict.postalCode = addr.postalCode;
    dict.sortingCode = addr.sortingCode;
    dict.languageCode = addr.languageCode;
    dict.organization = addr.organization;
    dict.recipient = addr.recipient;
  }
  return dict;
}

function done(
    message, shippingAddress, shippingOption, methodName, instrumentDetails) {
  var element = document.getElementById('contents');
  element.innerHTML = message;

  info(
      JSON.stringify(toDictionary(shippingAddress), undefined, 2) + '<br/>' +
      shippingOption + '<br/>' + methodName + '<br/>' +
      JSON.stringify(instrumentDetails, undefined, 2));
}

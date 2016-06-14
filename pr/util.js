var timeoutID1;
var timeoutID2;

/**
 * Prints the given error message.
 * @param {string} msg - The error message to print.
 */
function error(msg) {  // eslint-disable-line no-unused-vars
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
    if (element.className !== 'error') {
      return;
    }
    element.className = 'error-hide';
    timeoutID2 = window.setTimeout(function() {
      element.innerHTML = '';
      element.className = '';
    }, 500);
  }, 10000);
}

/**
 * Prints the given informational message.
 * @param {string} msg - The information message to print.
 */
function info(msg) {
  var element = document.getElementById('msg');
  element.innerHTML = msg;
  element.className = 'info';
}

/**
 * Converts an address object into a dictionary.
 * @param {PaymentAddress} addr - The address to convert.
 * @return {object} The resulting dictionary.
 */
function toDictionary(addr) {  // eslint-disable-line no-unused-vars
  var dict = {};
  if (addr) {
    dict.country = addr.country;
    dict.region = addr.region;
    dict.city = addr.city;
    dict.dependentLocality = addr.dependentLocality;
    dict.addressLine = addr.addressLine;
    dict.postalCode = addr.postalCode;
    dict.sortingCode = addr.sortingCode;
    dict.languageCode = addr.languageCode;
    dict.organization = addr.organization;
    dict.recipient = addr.recipient;
    dict.careOf = addr.careOf;
    dict.phone = addr.phone;
  }
  return dict;
}

/**
 * Called when the payment request is complete.
 * @param {string} message - The human readable message to display.
 * @param {ShippingAddress} shippingAddress - User's shipping address.
 * @param {string} shippingOption - User's preferred shipping opion.
 * @param {string} methodName - The type of payment instrument the user is
 *                              providing.
 * @param {object} instrumentDetails - The payment instrument data to charge.
 * @param {object} totalAmount - The total amount to charge.
 */
function done(message, shippingAddress, shippingOption, methodName, instrumentDetails, totalAmount) {  // eslint-disable-line no-unused-vars
  var element = document.getElementById('contents');
  element.innerHTML = message;
  info(JSON.stringify(totalAmount, undefined, 2) + '<br/>' +
    methodName + '<br/>' +
    JSON.stringify(instrumentDetails, undefined, 2) + '<br/>' +
    shippingOption + '<br/>' +
    JSON.stringify(toDictionary(shippingAddress), undefined, 2));
}

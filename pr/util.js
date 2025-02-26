/**
 * Toggles the picture-in-picture (on or off).
 */
function togglePictureInPicture() {
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture();
  } else if (document.pictureInPictureEnabled) {
    const video = document.getElementById('video');
    if (!video) {
      error('Cannot find the video on the page.');
      return;
    }
    video.requestPictureInPicture().catch((e) => {
      error('Failed to request picture-in-picture: \'' + e.message + '\'');
    });
  } else {
    error('Picture-in-picture is not available.');
  }
}

/**
 * Prints the given error message.
 * @param {string} msg - The error message to print.
 */
function error(msg) {  // eslint-disable-line no-unused-vars
  let element = document.createElement('pre');
  element.innerHTML = msg;
  element.className = 'error';
  document.getElementById('msg').appendChild(element);
  dismissPageDimmer();
}

/**
 * Prints the given informational message.
 * @param {string} msg - The information message to print.
 */
function info(msg) {
  let element = document.createElement('pre');
  element.innerHTML = msg;
  element.className = 'info';
  document.getElementById('msg').appendChild(element);
}

/**
 * Converts an address object into a dictionary.
 * @param {PaymentAddress} addr - The address to convert.
 * @return {object} The resulting dictionary.
 */
function toDictionary(addr) {  // eslint-disable-line no-unused-vars
  let dict = {};
  if (addr) {
    if (addr.toJSON) {
      return addr;
    }
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
    dict.phone = addr.phone;
  }
  return dict;
}

/**
 * Called when the payment request is complete.
 * @param {string} message - The human readable message to display.
 * @param {PaymentResponse} resp - The payment response.
 */
function done(message, resp) {  // eslint-disable-line no-unused-vars
  dismissPageDimmer();

  let element = document.getElementById('contents');
  element.innerHTML = message;

  if (resp.toJSON) {
    info(JSON.stringify(resp, undefined, 2));
    return;
  }

  let shippingOption = resp.shippingOption ?
      'shipping, delivery, pickup option: ' + resp.shippingOption + '<br/>' :
      '';

  let shippingAddress = resp.shippingAddress ?
      'shipping, delivery, pickup address: ' +
          JSON.stringify(toDictionary(resp.shippingAddress), undefined, 2) +
          '<br/>' :
      '';

  let instrument =
      'instrument:' + JSON.stringify(resp.details, undefined, 2) + '<br/>';

  let method = 'method: ' + resp.methodName + '<br/>';
  let email = resp.payerEmail ? 'email: ' + resp.payerEmail + '<br/>' : '';
  let phone = resp.payerPhone ? 'phone: ' + resp.payerPhone + '<br/>' : '';
  let name = resp.payerName ? 'name: ' + resp.payerName + '<br/>' : '';


  info(email + phone + name + shippingOption + shippingAddress + method +
      instrument);
}

/**
 * Clears all messages.
 */
function clearAllMessages() {  // eslint-disable-line no-unused-vars
  document.getElementById('msg').innerHTML = '';
}

let options = {
  types: ['deprecation'],
  buffered: true
}

let observer = new ReportingObserver(function(reports, observer) {
  for (const report of reports) {
    error(report.type + ": "+ JSON.stringify(report.body));
  }
}, options);

observer.observe();

/**
 * Shows a full page half-transparent overlay on top of the page content to
 * create the appearance of dimming the page.
 */
function showPageDimmer() {
  const dimmer = document.createElement('div');
  dimmer.id = 'dimmer';
  dimmer.style = 'position: fixed; padding: 0; margin: 0; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 1;';
  document.body.appendChild(dimmer);
}

/**
 * Removes the overlay on top of the page content.
 */
function dismissPageDimmer() {
  const dimmer = document.getElementById('dimmer');
  if (dimmer) {
    dimmer.remove();
  }
}

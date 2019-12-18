self.importScripts('data.js');

// TODO: Keep state in the window instead, because a single service worker
// can talk to multiple windows.

self.resolver = null;
self.response = responseData;
self.messageDestination = null;

function sendMessage(msg) {
  if (self.messageDestination) {
    console.log(
        'Sending message to payment handler window: ' +
        JSON.stringify(msg, undefined, 2));
    self.messageDestination.postMessage(msg);
  } else {
    console.log(
        'No destination found for message: ' +
        JSON.stringify(msg, undefined, 2));
  }
}

function findSelectedShippingOptionId(shippingOptions) {
  if (!shippingOptions)
    return '';
  for (option of shippingOptions) {
    if (option.selected)
      return option.id;
  }
  return '';
}

self.addEventListener('message', (evt) => {
  if (evt.data === 'confirm') {
    if (self.resolver !== null) {
      self.resolver(response);
      self.resolver = null;
    } else {
      sendMessage({
        error:
            'Service worker cannot confirm payment because there is no resolver function.'
      });
    }
  } else {
    sendMessage({
      error: 'Service worker did not recognize the message "' + evt.data + '".'
    });
  }
});

self.addEventListener('paymentrequest', (evt) => {
  if (evt.delegateToWindow) {
    evt.delegateToWindow('payment_handler_window.html');
    return;
  }
  // Populate response fields based on specified options in the request.
  self.response.payerName = evt.paymentOptions.requestPayerName ? 'Jon Doe' : '';
  self.response.payerEmail =
      evt.paymentOptions.requestPayerEmail ? 'jon.doe@gmail.com' : '';
  self.response.payerPhone =
      evt.paymentOptions.requestPayerPhone ? '+15555555555' : '';
  self.response.shippingAddress = evt.paymentOptions.requestShipping ? {
    city: 'Reston',
    country: 'US',
    dependentLocality: '',
    organization: 'Google',
    phone: '+15555555555',
    postalCode: '20190',
    recipient: 'Jon Doe',
    region: 'VA',
    sortingCode: '',
    addressLine: [
      '1875 Explorer St #1000',
    ],
  } :
                                                                       {};
  self.response.shippingOption = evt.paymentOptions.requestShipping ?
    findSelectedShippingOptionId(evt.shippingOptions) :
    '';

  evt.respondWith(new Promise((resolve) => {
    self.resolver = resolve;
    evt.openWindow('payment_handler_window.html')
        .then((windowClient) => {
          self.messageDestination = windowClient;
          self.messageDestination.postMessage({
            'total' : evt.total,
          });
        })
        .catch((error) => {
          console.log(error.message);
        });
  }));
});

const PAYMENT_APPS = [
  {
    description: 'App #1 - Supports shipping, payer name, payer email, and payer phone delegation',
    directory: 'delegate_all'
  },
  {
    description: 'App #2 - Supports shipping delegation only',
    directory: 'delegate_shipping'
  },
];

// Build the select menu for payment apps
for (const app of PAYMENT_APPS) {
  const option = document.createElement('option');
  option.text = app.description;
  document.getElementById('app_select').add(option);
}

/**
 * Initializes the payment request object.
 * @return {PaymentRequest} The payment request object.
 */
function buildPaymentRequest(options) {
  if (!window.PaymentRequest) {
    return null;
  }

  const selectedAppIndex = document.getElementById('app_select').selectedIndex;
  const selectedApp = PAYMENT_APPS[selectedAppIndex];
  const selectedAppUrl =  `https://rsolomakhin.github.io/pr/apps/delegation/${selectedApp.directory}/payment_method_manifest.json`;

  info(`Triggering payment app: ${selectedAppUrl}`);

  const supportedInstruments = [{
    supportedMethods: selectedAppUrl,
  }];

  const details = {
    total: {
      label: 'Donation',
      amount: {
        currency: 'USD',
        value: '55.00',
      },
    },
    displayItems: [{
      label: 'Original donation amount',
      amount: {
        currency: 'USD',
        value: '65.00',
      },
    }, {
      label: 'Friends and family discount',
      amount: {
        currency: 'USD',
        value: '-10.00',
      },
    }],
  };

  let request = null;

  try {
    request = new PaymentRequest(supportedInstruments, details, options);
  } catch (e) {
    error('Developer mistake: \'' + e.message + '\'');
  }

  return request;
}

/**
 * Handles the response from PaymentRequest.show().
 */
function handlePaymentResponse(response) {
    response.complete('success')
      .then(function() {
        info(JSON.stringify(response, undefined, 2));
      })
      .catch(function(err) {
        error(err);
        request = buildPaymentRequest();
      });
}

/**
 * Launches payment request for Bob Pay.
 */
function onBuyClicked(options) { // eslint-disable-line no-unused-vars
  let request = buildPaymentRequest(options);

  if (!window.PaymentRequest || !request) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    request.show()
      .then(handlePaymentResponse)
      .catch(function(err) {
        error(err);
        request = buildPaymentRequest();
      });
  } catch (e) {
    error('Developer mistake: \'' + e.message + '\'');
    request = buildPaymentRequest();
  }
}

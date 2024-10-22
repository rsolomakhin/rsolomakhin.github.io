/**
 * Updates the details based on the selected address.
 * @param {object} details - The current details to update.
 * @param {PaymentAddress} addr - The address selected by the user.
 * @return {object} The updated details.
 */
function updateDetails(details, addr) {
  if (addr.country === 'US') {
    var shippingOption = {
      id: '',
      label: '',
      amount: {
        currency: 'USD',
        value: '0.00'
      },
      selected: true
    };
    if (addr.region === 'CA') {
      shippingOption.id = 'ca';
      shippingOption.label = 'Free delivery in California';
      details.total.amount.value = '0.01';
    } else {
      shippingOption.id = 'us';
      shippingOption.label = 'Standard delivery in US';
      shippingOption.amount.value = '0.05';
      details.total.amount.value = '0.06';
    }
    details.shippingOptions = [shippingOption];
  } else {
    delete details.shippingOptions;
  }
  return details;
}

/**
 * Launches payment request that provides different delivery options based on
 * the delivery address that the user selects.
 */
function onBuyClicked() { // eslint-disable-line no-unused-vars
  var supportedInstruments = [{
      supportedMethods: 'https://google.com/pay',
      data: {
        allowedPaymentMethods: ['TOKENIZED_CARD', 'CARD'],
        apiVersion: 1,
        cardRequirements: {
          'allowedCardNetworks': ['VISA', 'MASTERCARD', 'AMEX'],
        },
        merchantName: 'Rouslan Solomakhin',
        merchantId: '00184145120947117657',
        paymentMethodTokenizationParameters: {
          tokenizationType: 'GATEWAY_TOKEN',
          parameters: {
            'gateway': 'stripe',
            'stripe:publishableKey': 'pk_live_lNk21zqKM2BENZENh3rzCUgo',
            'stripe:version': '2016-07-06',
          },
        },
      },
    },
  ];

  var details = {
    total: {
      label: 'Total',
      amount: {
        currency: 'USD',
        value: '0.01'
      }
    },
  };

  var options = {
    requestPayerEmail: true,
    requestShipping: true,
    shippingType: "delivery"
  };

  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    var request = new PaymentRequest(supportedInstruments, details, options);

    request.addEventListener('shippingaddresschange', function(e) {
      e.updateWith(new Promise(function(resolve) {
          resolve(updateDetails(details, request.shippingAddress));
      }));
    });

    request.show()
      .then(function(instrumentResponse) {
          instrumentResponse.complete('success')
            .then(function() {
              info(JSON.stringify(instrumentResponse, undefined, 2));
            })
            .catch(function(err) {
              error(err);
            });
      })
      .catch(function(err) {
        error(err);
      });
  } catch (e) {
    error('Developer mistake: \'' + e.message + '\'');
  }
}

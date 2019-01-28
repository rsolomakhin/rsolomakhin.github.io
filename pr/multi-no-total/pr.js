/* global done:false */
/* global error:false */
/* global PaymentRequest:false */

/**
 * Updates the shipping labels based on the selected shipping option.
 * @param {object} details - The current details to update.
 * @param {string} shippingOption - The shipping option selected by user.
 * @return {object} The updated details.
 */
function updateDetails(details, shippingOption) {
  var selectedShippingOption;
  var otherShippingOption;
  if (shippingOption === 'pigeon') {
    selectedShippingOption = details.shippingOptions[0];
    otherShippingOption = details.shippingOptions[1];
  } else {
    selectedShippingOption = details.shippingOptions[1];
    otherShippingOption = details.shippingOptions[0];
  }
  if (details.displayItems.length === 2) {
    details.displayItems.splice(1, 0, selectedShippingOption);
  } else {
    details.displayItems.splice(1, 1, selectedShippingOption);
  }
  selectedShippingOption.selected = true;
  otherShippingOption.selected = false;
  return details;
}

/**
 * Launches payment request that provides multiple shipping options worldwide at
 * the same shipping rate, regardless of the shipping method or destination
 * address.
 */
function onBuyClicked() { // eslint-disable-line no-unused-vars
  var supportedInstruments = [
    {
      supportedMethods: 'basic-card'
    }
  ];

  var details = {
    total: {
      label: 'TOTAL DONATION AMOUNT',
      amount: {
        currency: 'USD',
        value: '1.00'
      }
    },
    displayItems: [{
        label: 'Original donation amount',
        amount: {
          currency: 'USD',
          value: '2.00'
        }
      },
      {
        label: 'Friends and family discount',
        amount: {
          currency: 'USD',
          value: '-1.00'
        }
      }
    ],
    shippingOptions: [{
        id: 'pigeon',
        label: 'Pigeon Mail',
        amount: {
          currency: 'USD',
          value: '0.00'
        },
        selected: true
      },
      {
        id: 'paperplane',
        label: 'Paper Airplane',
        amount: {
          currency: 'USD',
          value: '0.00'
        }
      }
    ]
  };

  var options = {
    requestShipping: true
  };

  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    var request = new PaymentRequest(supportedInstruments, details, options);

    request.addEventListener('shippingaddresschange', function(e) {
      e.updateWith(new Promise(function(resolve) {
        window.setTimeout(function() {
          delete details.total;
          resolve(details);
        }, 500);
      }));
    });

    request.addEventListener('shippingoptionchange', function(e) {
      e.updateWith(new Promise(function(resolve) {
        delete details.total;
        resolve(updateDetails(details, request.shippingOption));
      }));
    });

    request.show()
      .then(function(instrumentResponse) {
        window.setTimeout(function() {
          instrumentResponse.complete('success')
            .then(function() {
              done('This is a demo website. No payment will be processed.', instrumentResponse);
            })
            .catch(function(err) {
              error(err);
            });
        }, 2000);
      })
      .catch(function(err) {
        error(err);
      });
  } catch (e) {
    error('Developer mistake: \'' + e.message + '\'');
  }
}

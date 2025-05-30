/* global done:false */
/* global error:false */
/* global PaymentRequest:false */

/**
 * Updates the details based on the selected address.
 * @param {object} details - The current details to update.
 * @param {PaymentAddress} addr - The address selected by the user.
 * @return {object} The updated details.
 */
function updateDetails(details, addr) {
  if (addr.country === 'US') {
    delete details.error;
    var shippingOption = {
      id: '',
      label: '',
      amount: {
        currency: 'USD',
        value: '0.00',
      },
      selected: true,
    };
    if (addr.region === 'CA') {
      shippingOption.id = 'ca';
      shippingOption.label = 'Free shipping in California';
      details.total.amount.value = '55.00';
    } else {
      shippingOption.id = 'us';
      shippingOption.label = 'Standard shipping in US';
      shippingOption.amount.value = '5.00';
      details.total.amount.value = '60.00';
    }
    details.displayItems.splice(1, 1, shippingOption);
    details.shippingOptions = [shippingOption];
  } else {
    delete details.shippingOptions;
    details.error = 'Cannot ship outside of US.';
  }
  return details;
}

/**
 * Launches payment request that provides different shipping options based on
 * the shipping address that the user selects.
 */
function onBuyClicked() {
  // eslint-disable-line no-unused-vars
  var supportedInstruments = [
    {
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
    {
      supportedMethods: 'https://bobbucks.dev/pay',
    },
  ];

  var pendingDetails = {
    total: {
      label: 'Calculating...',
      amount: {
        currency: 'USD',
        value: '0.00',
      },
    },
  };

  var options = {
    requestShipping: true,
  };

  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    var request = new PaymentRequest(
      supportedInstruments,
      pendingDetails,
      options,
    );

    var spinner = document.createElement('i');
    spinner.classList = 'fa fa-refresh fa-spin';
    var button = document.getElementById('buyButton');
    button.appendChild(spinner);

    request
      .show(
        new Promise(function(resolveShowPromise) {
          info('Calculating final price...');
          window.setTimeout(function() {
            button.removeChild(spinner);
            info('The final price is USD $55.00.');
            var details = {
              total: {
                label: 'Donation',
                amount: {
                  currency: 'USD',
                  value: '55.00',
                },
              },
              displayItems: [
                {
                  label: 'Original donation amount',
                  amount: {
                    currency: 'USD',
                    value: '65.00',
                  },
                },
                {
                  label: 'Pending shipping price',
                  amount: {
                    currency: 'USD',
                    value: '0.00',
                  },
                  pending: true,
                },
                {
                  label: 'Friends and family discount',
                  amount: {
                    currency: 'USD',
                    value: '-10.00',
                  },
                },
              ],
            };

            request.addEventListener('shippingaddresschange', function(e) {
              e.updateWith(
                new Promise(function(resolveShippingAddressChange) {
                    resolveShippingAddressChange(
                      updateDetails(details, request.shippingAddress),
                    );
                }),
              );
            });

            resolveShowPromise(details);
          }, 5000); // 5 seconds
        }),
      )
      .then(function(instrumentResponse) {
          instrumentResponse
            .complete('success')
            .then(function() {
              done(
                'This is a demo website. No payment will be processed.',
                instrumentResponse,
              );
            })
            .catch(function(err) {
              error(err);
            });
      })
      .catch(function(err) {
        error(err);
      });
  } catch (e) {
    error("Developer mistake: '" + e.message + "'");
  }
}

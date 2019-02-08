/* global done:false */
/* global error:false */
/* global PaymentRequest:false */

/**
 * Launches payment request that provides free shipping worldwide.
 */
function onBuyClicked() { // eslint-disable-line no-unused-vars
  var supportedInstruments = [{
      supportedMethods: 'https://android.com/pay',
      data: {
        merchantName: 'Rouslan Solomakhin',
        merchantId: '00184145120947117657',
        allowedCardNetworks: ['AMEX', 'MASTERCARD', 'VISA', 'DISCOVER'],
        paymentMethodTokenizationParameters: {
          tokenizationType: 'GATEWAY_TOKEN',
          parameters: {
            'gateway': 'stripe',
            'stripe:publishableKey': 'pk_live_lNk21zqKM2BENZENh3rzCUgo',
            'stripe:version': '2016-07-06'
          }
        }
      }
    },
    {
      supportedMethods: 'basic-card'
    }
  ];

  var details = {
    total: {
      label: 'TOTAL',
      amount: {
        currency: 'USD',
        value: '1.00'
      }
    },
    displayItems: [{
        label: 'Free worldwide shipping',
        amount: {
          currency: 'USD',
          value: '0.00'
        }
      }
    ],
    shippingOptions: [{
      id: 'freeShippingOption',
      label: 'Free worldwide shipping',
      amount: {
        currency: 'USD',
        value: '0.00'
      },
      selected: true
    }]
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
      // Empty dictionary response.
      e.updateWith({});
    });

    request.addEventListener('shippingoptionchange', function(e) {
      // Empty dictionary response.
      e.updateWith({});
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

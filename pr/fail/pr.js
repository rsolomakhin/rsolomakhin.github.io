/* global done:false */
/* global error:false */
/* global PaymentRequest:false */

/**
 * Launches payment request that provides free shipping worldwide.
 */
function onBuyClicked() {  // eslint-disable-line no-unused-vars
  var supportedInstruments = [
    {
      supportedMethods: ['https://android.com/pay'],
      data: {
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
      supportedMethods: [
        'visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'unionpay'
      ]
    }
  ];

  var details = {
    total: {label: 'Donation', amount: {currency: 'USD', value: '55.00'}},
    displayItems: [
      {
        label: 'Original donation amount',
        amount: {currency: 'USD', value: '65.00'}
      },
      {
        label: 'Friends and family discount',
        amount: {currency: 'USD', value: '-10.00'}
      },
      {
        label: 'Free worldwide shipping',
        amount: {currency: 'USD', value: '0.00'}
      }
    ],
    shippingOptions: [{
      id: 'freeShippingOption',
      label: 'Free worldwide shipping',
      amount: {currency: 'USD', value: '0.00'},
      selected: true
    }]
  };

  var options = {requestShipping: true};

  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    var request = new PaymentRequest(supportedInstruments, details, options);
    request.show()
        .then(function(instrumentResponse) {
          window.setTimeout(function() {
            instrumentResponse.complete('fail')
                .then(function() {
                  done('payment processing has failed.', instrumentResponse);
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

/* global done:false */
/* global error:false */
/* global PaymentRequest:false */

/**
 * Launches payment request for AliPay.
 */
function onBuyClicked() {  // eslint-disable-line no-unused-vars
  var supportedInstruments = [
    {
      // Browser downloads https://alipay.com/payment-app.json to verify
      // identity of the Android app that handles this payment.
      supportedMethods: ['https://alipay.com'],
      data: {
        // Browser does not parse this data and passes it directly to AliPay app.
        partner: '2088001159940003',
        _input_charset: 'UTF-8',
        sign_type: 'RSA',
        sign: 'e5815a4556db338ed237f7d3fd222184',
        out_trade_no: 'PARTNER_TRANS_ID_113'
      }
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
      }
    ]
  };

  if (!window.PaymentRequest) {
    error('This browser does not support web payments.');
    return;
  }

  try {
    var request = new PaymentRequest(supportedInstruments, details);
    request.show()
        .then(function(instrumentResponse) {
          window.setTimeout(function() {
            instrumentResponse.complete('success')
                .then(function() {
                  done('Thank you!', instrumentResponse);
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

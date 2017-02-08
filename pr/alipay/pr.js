/**
 * Launches payment request for Alipay.
 */
function onBuyClicked() { // eslint-disable-line no-unused-vars
  let supportedInstruments = [{
    supportedMethods: ['https://www.alipay.com/webpay'],
    data: {
      orderInfo: 'biz_content=%7B%22timeout_express%22%3A%2230m%22%2C%22product_code%22%3A%22QUICK_MSECURITY_PAY%22%2C%22total_amount%22%3A%220.01%22%2C%22subject%22%3A%22%E6%88%91%E6%98%AF%E6%B5%8B%E8%AF%95%E4%B8%9C%E8%A5%BF%3B%22%2C%22body%22%3A%22%E6%88%91%E6%98%AF%E6%B5%8B%E8%AF%95%E6%95%B0%E6%8D%AE%3B%22%2C%22out_trade_no%22%3A%221486526346841%22%7D&sign=mRs8nGetdSFZ6a48mWSkODioWi81glyGKq7vDp2DQ0aQ2aVz8C5rcbfxTggZBG9QvQyjBYkPPjEAfk1RNfqxGDVxNVe0amKNAZwiC%2Bs4loQ3WvliiovCtPWJBkP59EdeTBVgT0jbfY6Hl4hRHEyGM%2BIm7R3gkpHSkM2cU8BrnwI2Apn1gkn%2FlqLAWC%2BeHMpT%2Bjr%2BEv5RKCPyIVEA85y96JDfDOvjX0KEn9OjQFvUkJ0%2BvnM8r5AbLQTdlF6fXZ1Jnza1uo3LQ%2BiT6j0FCzvys9%2BxuV1kLGfRvVywQmUotnXg68Fejm93unzarKkpceeGrVRc51%2FU2M17j2PJGttkdQ%3D%3D&method=alipay.trade.app.pay&charset=utf-8&version=1.0&app_id=2014100900013222&timestamp=2017-02-08+11%3A59%3A06&sign_type=RSA2', // eslint-disable-line max-len
    },
  }];

  let details = {
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

  if (!window.PaymentRequest) {
    error('This browser does not support web payments.');
    return;
  }

  try {
    let request = new PaymentRequest(supportedInstruments, details);
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

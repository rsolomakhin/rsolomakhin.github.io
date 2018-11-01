/**
 * Launches payment request with shipping, but rejects update of details on
 * shipping address change. https://crbug.com/736764
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
            label: 'Donation',
            amount: {
                currency: 'USD',
                value: '55.00'
            }
        },
        displayItems: [{
                label: 'Original donation amount',
                amount: {
                    currency: 'USD',
                    value: '65.00'
                }
            },
            {
                label: 'Pending shipping price',
                amount: {
                    currency: 'USD',
                    value: '0.00'
                },
                pending: true
            },
            {
                label: 'Friends and family discount',
                amount: {
                    currency: 'USD',
                    value: '-10.00'
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
            e.updateWith(Promise.reject(Error('failed')));
        });

        request.show()
            .then(function(instrumentResponse) {
                window.setTimeout(function() {
                    instrumentResponse.complete('success')
                        .then(function() {
                            done('This is a demo website. No payment will be processed.', instrumentResponse);
                        })
                        .catch(function(err) {
                            error('Could not tell browser that the transaction succeeded: ' + err);
                        });
                }, 2000);
            })
            .catch(function(err) {
                error('Did not get a payment response: ' + err);
            });
    } catch (e) {
        error('Developer mistake: ' + e);
    }
}

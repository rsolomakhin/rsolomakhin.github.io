const PRTYPE = {
  UNKNOWN_ENUM_VALUES_IN_SUPPORTED_NETWORKS: 0,
  UNKNOWN_ENUM_VALUES_IN_SUPPORTED_TYPES: 1,
  DICTIONARY_SUPPORTED_NETWORKS: 2,
  STRING_SUPPORTED_NETWORKS_AND_TYPES: 3,
};

/**
 * Initializes the payment request object.
 * @param {PRTYPE} prtype - The type of payment request object to initialize.
 * @return {PaymentRequest} The payment request object.
 */
function buildPaymentRequest(prtype) {
  if (!window.PaymentRequest) {
    return null;
  }

  const supportedInstruments = [{
    supportedMethods: 
      'basic-card',
    
  }];

  if (prtype === PRTYPE.UNKNOWN_ENUM_VALUES_IN_SUPPORTED_NETWORKS) {
    supportedInstruments[0].data = {
      supportedNetworks: ['hooba-dooba'],
    };
  } else if (prtype === PRTYPE.UNKNOWN_ENUM_VALUES_IN_SUPPORTED_TYPES) {
    supportedInstruments[0].data = {
      supportedNetworks: ['hooba-dooba'],
      supportedTypes: ['this should throw?', 'credit'],
    };
  } else if (prtype == PRTYPE.DICTIONARY_SUPPORTED_NETWORKS) {
    supportedInstruments[0].data = {
      supportedNetworks: {
        'this-should-throw?': ['hooba-dooba'],
      },
      supportedTypes: ['credit'],
    };
  } else if (prtype == PRTYPE.STRING_SUPPORTED_NETWORKS_AND_TYPES) {
    supportedInstruments[0].data = {
      supportedNetworks: 'this will throw?',
      supportedTypes: 'so should this?',
    };
  } else {
    error('Unknown enum value ' + prtype);
    return null;
  }

  const details = {
    total: {
      label: 'Tots',
      amount: {
        currency: 'USD',
        value: '1.00',
      },
    },
  };

  let request = null;

  try {
    request = new PaymentRequest(supportedInstruments, details);
  } catch (e) {
    error('Developer mistake: \'' + e + '\'');
  }

  return request;
}

/**
 * Launches payment request for credit cards.
 * @param {PRTYPE} prtype - The type of payment request object to initialize.
 */
function onBuyClicked(prtype) { // eslint-disable-line no-unused-vars
  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    const request = buildPaymentRequest(prtype);
    if (!request) {
      error('Unable to build a payment request.');
      return;
    }
    request.show()
      .then(function(instrumentResponse) {
        window.setTimeout(function() {
          instrumentResponse.complete('success')
            .then(function() {
              done('This is a demo website. No payment will be processed.',
                instrumentResponse);
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
    error('Developer mistake: \'' + e + '\'');
  }
}

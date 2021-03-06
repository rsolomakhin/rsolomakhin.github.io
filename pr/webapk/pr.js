/* exported onBuyClicked */

async function setupServiceWorker() {
  const serviceWorkerSourceUrl = 'webapk-app.js';
  const registration = await navigator.serviceWorker.getRegistration(serviceWorkerSourceUrl);
  if (registration) {
    info('Service worker is installed.');
    return;
  }

  return navigator.serviceWorker.register(serviceWorkerSourceUrl);
}
setupServiceWorker();

let deferredPrompt = null;
const btnAdd = document.getElementById('btnAdd');

window.addEventListener('beforeinstallprompt', e => {
  deferredPrompt = e;
  btnAdd.style.display = 'inline';
});

async function addToHomeScreen() {
  if (!deferredPrompt) {
    return;
  }

  btnAdd.style.display = 'none';

  deferredPrompt.prompt();
  const choiceResult = await deferredPrompt.userChoice;
  deferredPrompt = null;

  if (choiceResult == 'accepted') {
    info('User accepted the prompt for adding to home screen.');
  } else {
    info('User dismissed the prompt for adding to home screen.');
  }
}

window.addEventListener('appinstalled', e => {
  info('Added to home screen.');
  btnAdd.style.display = 'none';
});

/**
 * Initializes the payment request object.
 * @return {PaymentRequest} The payment request object.
 */
function buildPaymentRequest() {
  if (!window.PaymentRequest) {
    return null;
  }

  // Documentation:
  // https://developers.google.com/pay/api/web/guides/tutorial
  const supportedInstruments = [{
    supportedMethods: 'https://google.com/pay',
    data: {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'VISA', 'MASTERCARD'],
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            'gateway': 'stripe',
            // Please use your own Stripe public key.
            'stripe:publishableKey': 'pk_live_lNk21zqKM2BENZENh3rzCUgo',
            'stripe:version': '2016-07-06',
          },
        },
      }],
      transactionInfo: {
        countryCode: 'US',
        currencyCode: 'USD',
        totalPriceStatus: 'FINAL',
        totalPrice: '1.00',
      },
      // Please use your own Google Pay merchant ID.
      merchantInfo: {
        merchantName: 'Rouslan Solomakhin',
        merchantId: '00184145120947117657',
      },
    },
  }];

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
    if (request.canMakePayment) {
      request.canMakePayment().then(function(result) {
        info(result ? "Can make payment" : "Cannot make payment");
      }).catch(function(err) {
        error(err);
      });
    }

    if (request.hasEnrolledInstrument) {
      request.hasEnrolledInstrument().then(function(result) {
        info(result ? "Has enrolled instrument" : "No enrolled instrument");
      }).catch(function(err) {
        error(err);
      });
    }
  } catch (e) {
    error('Developer mistake: \'' + e + '\'');
  }

  return request;
}

let request = buildPaymentRequest();

/**
 * Launches payment request for Android Pay.
 */
function onBuyClicked() {
  if (!window.PaymentRequest || !request) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    request.show()
      .then(function(instrumentResponse) {
        instrumentResponse.complete('success')
          .then(function() {
            info(JSON.stringify(instrumentResponse, undefined, 2));
          })
          .catch(function(err) {
            error(err);
            request = buildPaymentRequest();
          });
      })
      .catch(function(err) {
        error(err);
        request = buildPaymentRequest();
      });
  } catch (e) {
    error('Developer mistake: \'' + e + '\'');
    request = buildPaymentRequest();
  }
}

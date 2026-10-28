/**
 * Canopy & Co. Guest Checkout Demo — PaymentRequest integration
 *
 * Launches https://bobbucks.dev/pay with data.page = 'wallet_demo.html' and
 * static preferredSize dimensions for BobBucks (small) and BigBucks (large).
 */

const BOBBUCKS_METHOD = 'https://bobbucks.dev/pay';
const ORDER_TOTAL_VALUE = '148.50';
const ORDER_CURRENCY = 'USD';

/**
 * Reads the configured static preferredSize and 3D-Secure target dimensions.
 * @param {'bobbucks'|'bigbucks'} brand
 * @return {{preferredSize: {width: number, height: number}, threeDsSize: {width: number, height: number}}}
 */
function getConfiguredSizes(brand) {
  const isBigBucks = brand === 'bigbucks';
  const widthInputId = isBigBucks ? 'large-width' : 'small-width';
  const heightInputId = isBigBucks ? 'large-height' : 'small-height';

  const preferredWidth = Number(document.getElementById(widthInputId).value) || (isBigBucks ? 640 : 400);
  const preferredHeight = Number(document.getElementById(heightInputId).value) || (isBigBucks ? 600 : 220);

  const threeDsWidth = Number(document.getElementById('threeds-width').value) || 720;
  const threeDsHeight = Number(document.getElementById('threeds-height').value) || 500;

  return {
    preferredSize: {
      width: preferredWidth,
      height: preferredHeight,
    },
    threeDsSize: {
      width: threeDsWidth,
      height: threeDsHeight,
    },
  };
}

/**
 * Updates the size captions on the BobBucks and BigBucks buttons when inputs change.
 */
function updateButtonSizeLabels() {
  const smallSizes = getConfiguredSizes('bobbucks').preferredSize;
  const largeSizes = getConfiguredSizes('bigbucks').preferredSize;

  const bobbucksLabel = document.getElementById('bobbucks-size-label');
  const bigbucksLabel = document.getElementById('bigbucks-size-label');

  if (bobbucksLabel) {
    bobbucksLabel.textContent = `Compact Window (${smallSizes.width} \u00d7 ${smallSizes.height})`;
  }
  if (bigbucksLabel) {
    bigbucksLabel.textContent = `Expanded Window (${largeSizes.width} \u00d7 ${largeSizes.height})`;
  }
}

/**
 * Displays a status or error message inside the express checkout card.
 * @param {string} message
 * @param {'error'|'info'|''} type
 */
function setStatusBanner(message, type) {
  const banner = document.getElementById('payment-status-banner');
  if (!banner) return;
  if (!message) {
    banner.className = 'status-banner';
    banner.textContent = '';
    return;
  }
  banner.className = `status-banner ${type || 'info'}`;
  banner.textContent = message;
}

/**
 * Builds a PaymentRequest instance for the selected wallet brand.
 * @param {'bobbucks'|'bigbucks'} brand
 * @return {{request: PaymentRequest|null, preferredSize: {width: number, height: number}}}
 */
function buildWalletPaymentRequest(brand) {
  const sizes = getConfiguredSizes(brand);

  if (!window.PaymentRequest) {
    setStatusBanner('Payment Request API is not supported or not enabled in this browser.', 'error');
    return { request: null, preferredSize: sizes.preferredSize };
  }

  const supportedInstruments = [{
    supportedMethods: BOBBUCKS_METHOD,
    data: {
      page: 'wallet_demo.html',
      brand: brand,
      merchantName: 'Canopy & Co.',
      preferredSize: sizes.preferredSize,
      threeDsSize: sizes.threeDsSize,
    },
  }];

  const details = {
    displayItems: [
      {
        label: 'Alpine Daypack 22L',
        amount: { currency: ORDER_CURRENCY, value: '84.00' },
      },
      {
        label: 'Insulated Titanium Flask',
        amount: { currency: ORDER_CURRENCY, value: '38.00' },
      },
      {
        label: 'Merino Trail Beanie',
        amount: { currency: ORDER_CURRENCY, value: '16.00' },
      },
      {
        label: 'Estimated Tax',
        amount: { currency: ORDER_CURRENCY, value: '10.50' },
      },
    ],
    total: {
      label: 'Canopy & Co. Order Total',
      amount: {
        currency: ORDER_CURRENCY,
        value: ORDER_TOTAL_VALUE,
      },
    },
  };

  try {
    const request = new PaymentRequest(supportedInstruments, details);
    return { request, preferredSize: sizes.preferredSize };
  } catch (e) {
    setStatusBanner(`Could not initialize PaymentRequest: ${e.message}`, 'error');
    return { request: null, preferredSize: sizes.preferredSize };
  }
}

/**
 * Transitions the merchant page from the guest checkout form to the Order Complete view.
 * @param {PaymentResponse} response
 * @param {'bobbucks'|'bigbucks'} brand
 * @param {{width: number, height: number}} requestedSize
 */
function showOrderCompleteScreen(response, brand, requestedSize) {
  const details = (response && response.details) || {};

  const orderId = `#CNP-${Math.floor(10000 + Math.random() * 90000)}`;
  document.getElementById('receipt-order-number').textContent = `Order ${orderId}`;

  const defaultBrandLabel = brand === 'bigbucks' ? 'BigBucks Wallet Pro' : 'BobBucks Express';
  document.getElementById('receipt-wallet-brand').textContent =
      details.brandDisplayName || defaultBrandLabel;

  document.getElementById('receipt-window-size').textContent =
      `${requestedSize.width} \u00d7 ${requestedSize.height} px`;

  document.getElementById('receipt-auth-flow').textContent =
      details.flowLabel || details.flow || 'Payment Handler Verified';

  const instrumentText = details.instrumentSummary || 'BobBucks Instrument';
  document.getElementById('receipt-instrument-total').textContent =
      `${instrumentText} ($${ORDER_TOTAL_VALUE})`;

  document.getElementById('receipt-raw-json').textContent =
      JSON.stringify(response, undefined, 2);

  document.getElementById('checkout-view').style.display = 'none';
  document.getElementById('order-complete-view').classList.add('active');

  document.getElementById('breadcrumb-checkout').className = 'completed';
  document.getElementById('breadcrumb-confirmation').className = 'active';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Resets the page back to the guest checkout state so the user can test another flow.
 */
function resetCheckoutFlow() {
  setStatusBanner('', '');
  document.getElementById('order-complete-view').classList.remove('active');
  document.getElementById('checkout-view').style.display = '';

  document.getElementById('breadcrumb-checkout').className = 'active';
  document.getElementById('breadcrumb-confirmation').className = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Launches the Payment Handler for the chosen wallet brand ('bobbucks' or 'bigbucks').
 * @param {'bobbucks'|'bigbucks'} brand
 */
function onExpressWalletClicked(brand) {
  setStatusBanner('', '');
  const { request, preferredSize } = buildWalletPaymentRequest(brand);
  if (!request) {
    return;
  }

  try {
    showPageDimmer();
    request.show()
      .then((response) => {
        return response.complete('success').then(() => {
          dismissPageDimmer();
          showOrderCompleteScreen(response, brand, preferredSize);
        });
      })
      .catch((err) => {
        dismissPageDimmer();
        setStatusBanner(`Payment did not complete: ${err.message || err}`, 'info');
      });
  } catch (e) {
    dismissPageDimmer();
    setStatusBanner(`PaymentRequest error: ${e.message}`, 'error');
  }
}

function initCheckoutDemo() {
  const bobbucksBtn = document.getElementById('btn-pay-bobbucks');
  if (bobbucksBtn) {
    bobbucksBtn.addEventListener('click', () => onExpressWalletClicked('bobbucks'));
  }

  const bigbucksBtn = document.getElementById('btn-pay-bigbucks');
  if (bigbucksBtn) {
    bigbucksBtn.addEventListener('click', () => onExpressWalletClicked('bigbucks'));
  }

  const checkoutAgainBtn = document.getElementById('btn-checkout-again');
  if (checkoutAgainBtn) {
    checkoutAgainBtn.addEventListener('click', resetCheckoutFlow);
  }

  const brandLink = document.getElementById('store-brand-link');
  if (brandLink) {
    brandLink.addEventListener('click', (e) => {
      e.preventDefault();
      resetCheckoutFlow();
    });
  }

  ['small-width', 'small-height', 'large-width', 'large-height'].forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', updateButtonSizeLabels);
    }
  });

  updateButtonSizeLabels();
}

initCheckoutDemo();

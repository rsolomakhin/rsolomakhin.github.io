async function checkCanMakePayment(request) {
  if (!request.canMakePayment) {
    return;
  }

  try {
    const result = await request.canMakePayment();
    info(result ? "Can make payment" : "Cannot make payment");
  } catch (e) {
    error(e.toString());
  }
}

async function checkHasEnrolledInstrument(request) {
  if (!request.hasEnrolledInstrument) {
    return;
  }

  try {
    const result = await request.hasEnrolledInstrument();
    info(result ? "Has enrolled instrument" : "No enrolled instrument");
  } catch (e) {
    error(e.toString());
  }
}

function buildPaymentRequest() {
  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return null;
  }

  const supportedInstruments = [{
    supportedMethods: 'https://rsolomakhin.github.io/pr/apps/micro',
  }];

  const details = {
    total: {
      label: 'Payment',
      amount: {
        currency: 'USD',
        value: '1.00'
      }
    }
  };

  let request = null;

  try {
    request = new PaymentRequest(supportedInstruments, details);
  } catch (e) {
    error(e.toString());
    return null;
  }

  checkCanMakePayment(request);
  checkHasEnrolledInstrument(request);

  return request;
}

let request = buildPaymentRequest();

async function onBuyClicked() { // eslint-disable-line no-unused-vars
  if (!request) {
    return;
  }

  const r = request;
  request = null;

  try {
    const instrumentResponse = await r.show()
    await instrumentResponse.complete('success');
    done('This is a demo website. No payment will be processed.', instrumentResponse);
  } catch (e) {
    error(e.toString());
    request = buildPaymentRequest();
  }
}

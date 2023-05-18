async function runTest() {
  try {
    new PaymentRequest([{supportedMethods: window.location.href + 'manifest.json'}], {total: {label: 'Total', amount: {value: '0.01', currency: 'USD'}}}).show();
  } catch (e) {
    error(e);
  }
}

async function runTest() {
  try {
    await new PaymentRequest([{supportedMethods: window.location.href + 'manifest.json'}], {total: {label: 'Total', amount: {value: '0.01', currency: 'USD'}}}).show();
  } catch (e) {
    error(e);
  }
}

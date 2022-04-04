
async function checkCanMakePayment() {
  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }
  try {
    const textEncoder = new TextEncoder();
    const result = await new PaymentRequest([{
      supportedMethods: 'secure-payment-confirmation',
      data: {
        credentialIds: [textEncoder.encode('0')],
        instrument: {
          displayName: 'Display name',
          icon: 'https://rsolomakhin.github.io/pr/spc/troy-alt-logo.png',
        },
        challenge: textEncoder.encode('0'),
        timeout: 60000,
        payeeOrigin: window.location.origin,
        rpId: window.location.hostname,
      },
    }], {
      total: {label: 'Total', amount: {currency: 'USD', value: '0.01'}},
    }).canMakePayment();
    info(result ? "SPC feature is available." : "SPC feature is not available.");
    if (result) {
      if (window.PaymentCredential) {
        info("Registration should use the PaymentCredential: navigator.credentials.create({payment}).");
      } else {
        info("Registration should use the 'payment' extension.");
      }
    }
  } catch (err) {
    error(err);
  }
}

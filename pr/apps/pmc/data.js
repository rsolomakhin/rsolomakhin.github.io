// The data should be stored on the server.

const response1 = {
  methodName: 'https://rsolomakhin.github.io/pr/apps/pmc',
  details: {
      billingAddress: {
          addressLine: [
              '340 Main St',
          ],
          city: 'Venice',
          country: 'US',
          dependentLocality: '',
          organization: 'Google',
          phone: '+13103106000',
          postalCode: '90291',
          recipient: 'Jon Doe',
          region: 'CA',
          sortingCode: ''
      },
      cardNumber: '378282246310005',
      cardType: 'amex',
      cardSecurityCode: '2302',
      cardholderName: 'Jon Doe',
      expiryMonth: '09',
      expiryYear: '2029',
  },
};

const response2 = {
  methodName: 'https://rsolomakhin.github.io/pr/apps/pmc',
  details: {
      billingAddress: {
          addressLine: [
              '1-13 St Giles High St',
          ],
          city: 'London',
          country: 'GB',
          dependentLocality: '',
          organization: 'Google',
          phone: '+442070313000',
          postalCode: 'WC2H 8AG',
          recipient: 'Jon Doe',
          region: '',
          sortingCode: ''
      },
      cardNumber: '4012888888881881',
      cardType: 'visa',
      cardSecurityCode: '123',
      cardholderName: 'Jon Doe',
      expiryMonth: '11',
      expiryYear: '2021',
  },
};

function redact(input) {
  return {
    billingAddress: {
      country: input.details.billingAddress.country,
      region: input.details.billingAddress.region,
      city: input.details.billingAddress.city,
      postalCode: input.details.billingAddress.postalCode,
      sortingCode: input.details.billingAddress.sortingCode,
    },
    cardNumber: '****' + input.details.cardNumber.substring(input.details.cardNumber.length - 4),
    cardType: input.details.cardType,
  };
}

async function storePassword() {
  try {
    const request = new PaymentRequest([{
      supportedMethods: 'https://rsolomakhin.github.io/pr/apps/password',
      data: {
        action: 'store',
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
      },
    }], {
      total: {
        label: 'N/A',
        amount: {
          currency: 'USD',
          value: '0.00'
        }
      }
    });
    const response = await request.show();
    document.getElementById('msg').innerHTML = JSON.stringify(response.details);
    document.getElementById('status').innerHTML = 'Username and password stored.';
    await response.complete('success');
  } catch (e) {
    document.getElementById('msg').innerHTML = e.toString();
    document.getElementById('status').innerHTML = 'Error.';
  }
}

async function clearForm() {
  try {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('msg').innerHTML = '';
    document.getElementById('status').innerHTML = 'Form cleared.';
  } catch (e) {
    document.getElementById('msg').innerHTML = e.toString();
    document.getElementById('status').innerHTML = 'Error.';
  }
}

async function getPassword() {
  try {
    const request = new PaymentRequest([{
      supportedMethods: 'https://rsolomakhin.github.io/pr/apps/password',
      data: {
        action: 'get',
      },
    }], {
      total: {
        label: 'N/A',
        amount: {
          currency: 'USD',
          value: '0.00'
        }
      }
    });
    const response = await request.show();
    if (response.details.username) {
      document.getElementById('username').value = response.details.username;
    }
    if (response.details.password) {
      document.getElementById('username').value = response.details.password;
    }
    document.getElementById('msg').innerHTML = JSON.stringify(response.details);
    document.getElementById('status').innerHTML = 'Form filled.';
    await response.complete('success');
  } catch (e) {
    document.getElementById('msg').innerHTML = e.toString();
    document.getElementById('status').innerHTML = 'Error.';
  }
}

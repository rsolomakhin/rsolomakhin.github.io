if ((window.location.host === 'rsolomakhin.github.io') &&
  (window.location.protocol !== 'https:')) {
  window.location.protocol = 'https:';
}

window.onload = () => {
  if (!navigator.credentials || !window.PasswordCredential) {
    return;
  }

  const syncButton = document.getElementById('sync');
  const forgetButton = document.getElementById('forget');
  const errorsParagraph = document.getElementById('errors');
  const sessionIdentifierParagraph = document.getElementById('session');
  const numberOfWidgets = document.getElementById('number');
  let credential = null;

  numberOfWidgets.onchange = e => {
    if (credential) {
      credential.password = numberOfWidgets.value;
      navigator.credentials.store(credential).catch((error) => {
        errorsParagraph.innerHTML = error;
      });
    }
  };

  syncButton.onclick = (e) => {
    navigator.credentials.get({
        password: true,
        mediation: 'silent'
      })
      .then(cred => {
        if (cred) {
          sessionIdentifierParagraph.innerHTML = cred.id;
          numberOfWidgets.value = cred.password;
          credential = cred;
          syncButton.style.display = 'none';
          forgetButton.style.display = 'inline';
        } else {
          credential = new PasswordCredential({
            // In production, generate a unique ID on the server.
            id: 'light-weight-user-session-' +
              Math.floor(Math.random() * 1000000000000000000),
            name: 'Light Weight User Session',
            // In production, UI state should be saved in cookies and on the
            // server instead of in this password field. This password field
            // can be a large random number.
            password: numberOfWidgets.value
          });
          navigator.credentials.store(credential)
            .then(() => {
              sessionIdentifierParagraph.innerHTML = credential.id;
              syncButton.style.display = 'none';
              forgetButton.style.display = 'inline';
            })
            .catch(error => {
              errorsParagraph.innerHTML = error;
            });
        }
      })
      .catch(error => {
        errorsParagraph.innerHTML = error;
      });

  };

  forgetButton.onclick =
    (e) => {
      credential = null;
      sessionIdentifierParagraph.innerHTML = '';
      if (navigator.credentials.preventSilentAccess) {
        navigator.credentials.preventSilentAccess();
      }
      forgetButton.style.display = 'none';
      syncButton.style.display = 'inline';
    };

  // In production, save the UI state in a cookie and on the server to make it
  // stateful.
  syncButton.style.display = 'inline';
};

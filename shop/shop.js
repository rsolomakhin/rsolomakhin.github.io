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
    navigator.credentials.get({password : true, mediation : 'required'})
        .then(cred => {
          if (cred) {
            sessionIdentifierParagraph.innerHTML = cred.id;
            numberOfWidgets.value = cred.password;
            credential = cred;
            syncButton.style.display = 'none';
            forgetButton.style.display = 'inline';
          } else {
            // In production, generate a unique ID on the server.
            const username = 'light-weight-user-session-' +
                             Math.floor(Math.random() * 1000000000000000000);
            sessionIdentifierParagraph.innerHTML = username;
            credential = new PasswordCredential({
              id : username,
              name : 'Light Weight User Session',
              password : numberOfWidgets.value
            });
            navigator.credentials.store(credential)
                .then(() => {
                  syncButton.style.display = 'none';
                  forgetButton.style.display = 'inline';
                })
                .catch(error => { errorsParagraph.innerHTML = error; });
          }
        })
        .catch(error => { errorsParagraph.innerHTML = error; });

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
      }
};

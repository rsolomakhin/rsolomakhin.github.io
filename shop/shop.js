if ((window.location.host === "rsolomakhin.github.io") &&
    (window.location.protocol !== "https:")) {
  window.location.protocol = "https:";
}

window.onload = () => {
  if (!navigator.credentials || !window.PasswordCredential) {
    return;
  }

  const syncButton = document.getElementById("sync");
  const forgetButton = document.getElementById("forget");
  const errorsParagraph = document.getElementById("errors");
  const sessionIdentifierParagraph = document.getElementById("session");
  const numberOfWidgets = document.getElementById("number");

  syncButton.onclick = (e) => {
    navigator.credentials.get({password : true})
        .then(cred => {
          if (cred) {
            sessionIdentifierParagraph.innerHTML = cred.id;
            numberOfWidgets.value = cred.password;
            syncButton.style.display = "none";
            forgetButton.style.display = "inline";
          } else {
            // In production, generate a unique ID on the server.
            const username = "light-weight-user-session-" +
                             Math.floor(Math.random() * 1000000000000000000);
            sessionIdentifierParagraph.innerHTML = username;
            const newCredential = new PasswordCredential(
                {id : username, password : numberOfWidgets.value});
            navigator.credentials.store(newCredential)
                .then(() => {
                  syncButton.style.display = "none";
                  forgetButton.style.display = "inline";
                })
                .catch(error => { errorsParagraph.innerHTML = error; });
          }
        })
        .catch(error => { errorsParagraph.innerHTML = error; });

  };

  forgetButton.onclick =
      (e) => {
        sessionIdentifierParagraph.innerHTML = '';
        navigator.credentials.preventSilentAccess();
        forgetButton.style.display = "none";
        syncButton.style.display = "inline";
      }

  navigator.credentials.get({password : true, mediation: 'silent'})
      .then(cred => {
        if (cred) {
          sessionIdentifierParagraph.innerHTML = cred.id;
          numberOfWidgets.value = cred.password;
          syncButton.style.display = "none";
          forgetButton.style.display = "inline";
        } else {
          syncButton.style.display = "inline";
          forgetButton.style.display = "none";
        }
      })
      .catch(error => {
        syncButton.style.display = "inline";
        forgetButton.style.display = "none";
      });
};

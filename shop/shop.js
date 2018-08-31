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
  const numberOfWidgets = document.getElementById("number");
  let lightWeightUserSession = null;

  syncButton.style.display = "inline";
  syncButton.onclick = (e) => {
    navigator.credentials.get({password : true})
        .then(cred => {
          if (cred) {
            lightWeightUserSession = cred;
            numberOfWidgets.value = lightWeightUserSession.password;
            syncButton.style.display = "none";
            forgetButton.style.display = "inline";
          } else {
            // In production, generate a unique ID on the server.
            const username = "light-weight-user-session-" +
                             Math.floor(Math.random() * 1000000000000000000);
            lightWeightUserSession = new PasswordCredential(
                {id : username, password : numberOfWidgets.value});
            navigator.credentials.store(lightWeightUserSession)
                .then(() => {
                  syncButton.style.display = "none";
                  forgetButton.style.display = "inline";
                })
                .catch(error => { errorsParagraph.innerHTML = error; });
          }
        })
        .catch(error => { errorsParagraph.innerHTML = error; });

  };

  forgetButton.onclick = (e) => {
    lightWeightUserSession = null;
    navigator.credentials.preventSilentAccess();
    forgetButton.style.display = "none";
    syncButton.style.display = "inline";
  }
};

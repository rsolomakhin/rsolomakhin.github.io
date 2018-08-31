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

  syncButton.style.display = "inline";
  syncButton.onclick = (e) => {
    navigator.credentials.get({password : true})
        .then(cred => {
          if (cred) {
            console.log("Found a credential:");
            console.log(cred);
          } else {
            // In production, generate a unique ID on the server.
            const username = "light-weight-user-session-" +
                       Math.floor(Math.random() * 1000000000000000000);
            console.log("No credential yet, let's generate one");
            console.log(username);
            navigator.credentials.store(new PasswordCredential({
              id: username,
              password: document.getElementById("number").value
            })).then(() => {
              syncButton.style.display = "none";
              forgetButton.style.display = "inline";
            }).catch(error => {
              console.log(error);
              errorsParagraph.innerHTML = error;
            });
          }
        })
        .catch(error => {
          console.log(error);
          errorsParagraph.innerHTML = error;
        });

  };

  forgetButton.onclick = (e) => {
    navigator.credentials.preventSilentAccess();
    console.log("bye!");
    forgetButton.style.display = "none";
    syncButton.style.display = "inline";
  }
};

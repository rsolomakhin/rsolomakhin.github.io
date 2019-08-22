const parts = window.location.href.split('#');
const origin = parts[1];
const action = parts[2];
const username = parts[3];
const password = parts[4];
document.getElementById('origin').innerHTML = origin;
document.getElementById('action').innerHTML = action;
if (action == 'store') {
  document.getElementById('username').innerHTML = username;
}
const button = document.getElementById('confirm');
const pleasewait = document.getElementById('pleasewait');
button.addEventListener('click', (evt) => {
  button.style.display = 'none';
  pleasewait.style.display = 'block';
  let details = {
    status: 'success'
  };
  if (action === 'get') {
    details.username = window.localStorage.getItem(origin + '#username');
    details.password = window.localStorage.getItem(origin + '#password');
  } else {
    window.localStorage.setItem(origin + '#username', username);
    window.localStorage.setItem(origin + '#password', password);
  }
  navigator.serviceWorker.controller.postMessage(details);
});

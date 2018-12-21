const button = document.getElementById('confirm');
const pleasewait = document.getElementById('pleasewait');
.addEventListener('click', (evt) => {
  button.style.display = 'none';
  pleasewait.style.display = 'block';
  navigator.serviceWorker.controller.postMessage('confirm');
});

document.getElementById('confirm').addEventListener('click', (evt) => {
  navigator.serviceWorker.controller.postMessage('confirm');
});

const params = new URLSearchParams(window.location.search);
const card = params.get('card');
if (card === '1') {
  document.getElementById('card1').style.display = 'block';
} else if (card === '2') {
  document.getElementById('card2').style.display = 'block';
}
const button = document.getElementById('confirm');
const pleasewait = document.getElementById('pleasewait');
button.addEventListener('click', (evt) => {
  button.style.display = 'none';
  pleasewait.style.display = 'block';
  navigator.serviceWorker.controller.postMessage('confirm');
});

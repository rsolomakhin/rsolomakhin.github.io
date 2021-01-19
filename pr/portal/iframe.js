function showFullPage() {
  for (div of document.getElementsByClassName('fullpage')) {
    div.style.display = 'block';
  }
  for (div of document.getElementsByClassName('embedded')) {
    div.style.display = 'none';
  }
  document.getElementById('merchant').src = 'index.html';
}

function closeOverlay() {
  window.location.href = 'index.html';
}

if (window.self === window.top) {
  showFullPage();
}

document.getElementById('close-button').addEventListener('click', (event) => {
  closeOverlay();
});

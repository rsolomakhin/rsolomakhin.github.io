function showFullPage(merchantPortal) {
  for (div of document.getElementsByClassName('fullpage')) {
    div.style.display = 'block';
  }
  for (div of document.getElementsByClassName('embedded')) {
    div.style.display = 'none';
  }
  if (!merchantPortal) {
    return;
  }
  merchantPortal.id = 'merchant';
  document.getElementById('fullpage').appendChild(merchantPortal);
}

function closeOverlay() {
  document.getElementById('merchant').activate();
}

if (!window.portalHost) {
  showFullPage();
}

window.addEventListener('portalactivate', (event) => {
  showFullPage(event.adoptPredecessor());
});

document.getElementById('close-button').addEventListener('click', (event) => {
  closeOverlay();
});

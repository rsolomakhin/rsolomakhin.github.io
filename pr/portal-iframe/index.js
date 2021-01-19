for (div of document.getElementsByClassName('button-overlay')) {
  div.addEventListener('click', (event) => {
    div = event.target;
    iframe = div.previousSibling.previousSibling;
    window.location.href = iframe.src;
  });
}

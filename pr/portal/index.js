for (div of document.getElementsByClassName('button-overlay')) {
  div.addEventListener('click', (event) => {
    div = event.target;
    portal = div.previousSibling.previousSibling;
    portal.activate();
  });
}
